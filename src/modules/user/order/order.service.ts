import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { OrderEntity } from 'src/entities/order.entity';
import { CreateOrdersDto } from 'src/dto/order.dto';
import { LeadEntity } from 'src/entities/lead.entity';
import { CartEntity } from 'src/entities/cart.entity';

@Injectable()
export class OrderService extends BaseService {
  private orderRepository: Repository<OrderEntity>;
  private leadRepository: Repository<LeadEntity>;
  private cartRepository: Repository<CartEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.orderRepository = this.dataSource.getRepository(OrderEntity);
    this.leadRepository = this.dataSource.getRepository(LeadEntity);
    this.cartRepository = this.dataSource.getRepository(CartEntity);
  }
  async findAll(userId: string) {
    return await this.orderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['orderItems', 'orderItems.lead', 'address'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!order) {
      throw new NotFoundException(`Order not found`);
    }
    return order;
  }

  async create(createBulkOrderDto: CreateOrdersDto, userId: string) {
    const ordersToSave = [];

    for (const orderInfo of createBulkOrderDto.orders) {
      const leadInfo = await this.leadRepository.findOne({
        where: { id: orderInfo.leadId },
      });

      if (!leadInfo) {
        throw new NotFoundException(
          `Lead with ID ${orderInfo.leadId} not found`,
        );
      }

      ordersToSave.push({
        lead: { id: orderInfo.leadId },
        price: leadInfo.price,
        quantity: orderInfo.quantity,
      });
    }

    const subtotal = ordersToSave.reduce(
      (value, order) => value + order.price * order.quantity,
      0,
    );
    const gst = Math.round(0.18 * subtotal * 100) / 100; // Rounds to 2 decimal places
    const total = subtotal + gst;

    const bulkOrders = this.orderRepository.create({
      user: { id: userId },
      address: { id: createBulkOrderDto.addressId },
      razorPayId: createBulkOrderDto.razorPayId,
      subtotal,
      gst,
      total,
      isBulkOrder: true,
      orderItems: ordersToSave,
    });

    try {
      const placedOrders = await this.orderRepository.save(bulkOrders);
      this.cartRepository.delete({ user: { id: userId } });
      return placedOrders;
    } catch (error) {
      throw new InternalServerErrorException('Failed to place bulk orders');
    }
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.orderRepository.remove(address);
  }
}
