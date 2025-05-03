import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { LeadEntity } from 'src/entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from 'src/dto/lead.dto';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class LeadService extends BaseService {
  private leadRepository: Repository<LeadEntity>;
  private s3Client: S3Client;

  constructor(private dataSource: DataSource) {
    super();
    this.s3Client = new S3Client({ region: process.env.AWS_REGION }); // Replace 'your-region' with your AWS region
    this.leadRepository = this.dataSource.getRepository(LeadEntity);
  }

  async findAll(req: any) {
    let leads = [];
    const userId = req?.user?.id || null;
    const locationId = req?.query?.locationId
      ? Number(req.query.locationId)
      : null;

    if (locationId) {
      leads = await this.leadRepository.find({
        where: { locationId: locationId, status: 'available' },
        relations: ['cart', 'cart.user', 'favorites', 'favorites.user'],
        order: { updatedAt: 'DESC' },
      });
    } else {
      leads = await this.leadRepository.find({
        relations: ['cart', 'cart.user', 'favorites', 'favorites.user'],
        order: { updatedAt: 'DESC' },
      });
    }
    return leads.map((lead) => {
      lead['isInCart'] = lead.cart.some((cart) => cart.user.id === userId);
      lead['isFavorite'] = lead.favorites.some(
        (favorite) => favorite.user.id === userId,
      );
      return lead;
    });
  }

  async findOne(id: string, userId: string | null = null) {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['cart', 'cart.user', 'favorites', 'favorites.user'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    lead['isInCart'] = lead.cart.some((cart) => cart.user.id === userId);
    lead['isFavorite'] = lead.favorites.some(
      (favorite) => favorite.user.id === userId,
    );
    return lead;
  }

  async create(createLeadDto: CreateLeadDto) {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      availableQty: createLeadDto.stockQty,
    });
    try {
      const leadInfo = await this.leadRepository.save(lead);
      await this.moveLeadImage(leadInfo);
      return leadInfo;
    } catch (error) {
      console.log(error.message, error);
      throw new InternalServerErrorException('Failed to create lead');
    }
  }

  async moveLeadImage(leadInfo: { fileName: string; id: string }) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const tempKey = `temp/${leadInfo.fileName}`;
    const finalKey = `images/${leadInfo.id}/${leadInfo.fileName}`;

    try {
      const copyCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${tempKey}`,
        Key: finalKey,
        ACL: 'public-read',
      });

      try {
        await this.s3Client.send(copyCommand);
      } catch (error) {
        if (error.name === 'NoSuchKey') {
          console.error('File does not exist in S3:', error);
          return;
        }
        throw error;
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: tempKey,
      });
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Failed to move file in S3:', error);
      throw new InternalServerErrorException('Failed to move file in S3.');
    }
  }

  removeLeadImage(leadInfo: { fileName: string; id: string }) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const key = `images/${leadInfo.id}/${leadInfo.fileName}`;

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3.');
    }
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const leadInfo = await this.findOne(id);
    const updatedLead = this.leadRepository.merge(leadInfo, updateLeadDto);
    await this.moveLeadImage(updatedLead);
    return this.leadRepository.save(updatedLead);
  }

  async remove(id: string) {
    const lead = await this.findOne(id);
    this.removeLeadImage(lead);
    await this.leadRepository.remove(lead);
  }

  async getOrderStats() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const totalPurchasedLeads = await queryRunner.manager
        .createQueryBuilder('order_items', 'oi')
        .select('COUNT(DISTINCT oi.leadId)', 'count')
        .getRawOne();

      const totalCustomers = await queryRunner.manager
        .createQueryBuilder('orders', 'o')
        .select('COUNT(DISTINCT o.userId)', 'count')
        .getRawOne();

      const totalRevenue = await queryRunner.manager
        .createQueryBuilder('orders', 'o')
        .select('SUM(o.total)', 'sum')
        .getRawOne();

      const totalOrders = await queryRunner.manager
        .createQueryBuilder('orders', 'o')
        .select('COUNT(o.id)', 'count')
        .getRawOne();

      return {
        totalPurchasedLeads: totalPurchasedLeads?.count || 0,
        totalCustomers: totalCustomers?.count || 0,
        totalRevenue: totalRevenue?.sum || 0,
        totalOrders: totalOrders?.count || 0,
      };
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw new InternalServerErrorException('Failed to fetch order stats');
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerOrders() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const customerOrders = await queryRunner.manager
        .createQueryBuilder('order_items', 'oi')
        .innerJoin('leads', 'l', 'oi.leadId = l.id')
        .innerJoin('orders', 'o', 'oi.orderId = o.id')
        .innerJoin('users', 'u', 'o.userId = u.id')
        .innerJoin('addresses', 'a', 'o.addressId = a.id')
        .select([
          'l.id AS leadId',
          'l.name AS leadName',
          'u.id AS userId',
          'u.username AS username',
          'u.email AS userEmail',
          'oi.price AS basePrice',
          'ROUND(oi.price * oi.quantity * 1.18, 2) AS purchasedAmount', // Including 18% GST, rounded to 2 decimals
          'o.createdAt AS purchasedDate',
          `CONCAT(a.streetAddress, ', ', a.city, ', ', a.postcode, ', ', a.state) AS deliveredAddress`,
          'a.phone AS deliveryPhoneNumber', // Added delivery phone number
        ])
        .orderBy('o.createdAt', 'DESC') // Sort by purchasedDate in descending order
        .getRawMany();

      return customerOrders;
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      throw new InternalServerErrorException('Failed to fetch customer orders');
    } finally {
      await queryRunner.release();
    }
  }
}
