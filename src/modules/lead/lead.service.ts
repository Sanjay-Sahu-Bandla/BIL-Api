import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { LeadEntity } from 'src/entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from 'src/dto/lead.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LeadService extends BaseService {
  private leadRepository: Repository<LeadEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.leadRepository = this.dataSource.getRepository(LeadEntity);
  }

  async findAll(req: any) {
    const locationId = req?.query?.locationId
      ? Number(req.query.locationId)
      : null;
    if (locationId) {
      return await this.leadRepository.find({
        where: { locationId: locationId, status: 'available' },
        relations: ['cart', 'favorites'],
        order: { updatedAt: 'DESC' },
      });
    }
    return await this.leadRepository.find({
      relations: ['cart', 'favorites'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['cart', 'favorites'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async create(createLeadDto: CreateLeadDto) {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      availableQty: createLeadDto.stockQty,
    });
    try {
      const leadInfo = await this.leadRepository.save(lead);
      this.moveLeadImage(leadInfo);
      return leadInfo;
    } catch (error) {
      console.log(error.message, error);
      throw new InternalServerErrorException('Failed to create lead');
    }
  }

  moveLeadImage(leadInfo: { fileName: string; id: string }) {
    const leadsFolder = path.join(
      __dirname,
      `../../../assets/leads/images`,
      leadInfo.id,
    );
    if (!fs.existsSync(leadsFolder)) {
      fs.mkdirSync(leadsFolder, { recursive: true });
    }

    const { fileName } = leadInfo;
    const tempFilePath = path.join(__dirname, `../../../temp/leads`, fileName);
    const leadsFolderPath = path.join(leadsFolder, fileName);

    if (!fs.existsSync(tempFilePath)) {
      // throw new NotFoundException(`File ${fileName} not found in temp folder`);
      console.log(`File ${fileName} not found in temp folder`);
      return;
    }

    try {
      fs.renameSync(tempFilePath, leadsFolderPath);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to move file to leads folder',
      );
    }
  }

  removeLeadImage(leadInfo: { fileName: string; id: string }) {
    const leadsFolder = path.join(
      __dirname,
      `../../../assets/leads/images`,
      leadInfo.id,
    );
    const leadsFolderPath = path.join(leadsFolder, leadInfo.fileName);

    if (fs.existsSync(leadsFolderPath)) {
      try {
        fs.unlinkSync(leadsFolderPath);
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to remove file from leads folder',
        );
      }
    }
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const leadInfo = await this.findOne(id);
    const updatedLead = this.leadRepository.merge(leadInfo, updateLeadDto);
    this.moveLeadImage(updatedLead);
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
          'ROUND(oi.price * 1.18, 2) AS purchasedAmount', // Including 18% GST, rounded to 2 decimals
          'o.createdAt AS purchasedDate',
          `CONCAT(a.streetAddress, ', ', a.city, ', ', a.postcode, ', ', a.state) AS deliveredAddress`,
          'a.phone AS deliveryPhoneNumber', // Added delivery phone number
        ])
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
