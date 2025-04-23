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
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class OrderService extends BaseService {
  private razorpay: Razorpay;
  private orderRepository: Repository<OrderEntity>;
  private leadRepository: Repository<LeadEntity>;
  private cartRepository: Repository<CartEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.orderRepository = this.dataSource.getRepository(OrderEntity);
    this.leadRepository = this.dataSource.getRepository(LeadEntity);
    this.cartRepository = this.dataSource.getRepository(CartEntity);

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
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

  verifySignature(orderId: string, paymentId: string, signature: string) {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  async create(createBulkOrderDto: CreateOrdersDto, userId: string) {
    const ordersToSave = [];

    for (const orderInfo of createBulkOrderDto.orders) {
      const leadInfo = await this.leadRepository.findOne({
        where: { id: orderInfo.leadId },
      });
      const existingOrderItem = await this.orderRepository.findOne({
        where: {
          user: { id: userId },
          orderItems: {
            lead: { id: orderInfo.leadId },
          },
        },
        relations: ['orderItems', 'orderItems.lead'],
      });

      if (existingOrderItem) {
        throw new NotFoundException(
          `Lead with ID ${orderInfo.leadId} has already been purchased`,
        );
      }

      if (!leadInfo) {
        throw new NotFoundException(
          `Lead with ID ${orderInfo.leadId} not found`,
        );
      }

      ordersToSave.push({
        lead: { id: orderInfo.leadId },
        price: leadInfo.sellingPrice,
        quantity: orderInfo.quantity,
      });
    }

    const subtotal = ordersToSave.reduce(
      (value, order) => value + order.price * order.quantity,
      0,
    );
    const gst = Math.round(0.18 * subtotal * 100) / 100;
    const total = subtotal + gst;

    // Razorpay order creation
    const razorpayOrder = await this.razorpay.orders.create({
      amount: total * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      payment_capture: true,
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subtotal,
      gst,
      total,
    };
  }

  async saveOrderToDb(payload: any, userId: string) {
    const { orders, addressId, razorpay_order_id, razorpay_payment_id } =
      payload;

    const ordersToSave = [];

    for (const orderInfo of orders) {
      const leadInfo = await this.leadRepository.findOne({
        where: { id: orderInfo.leadId },
      });

      if (!leadInfo) {
        throw new NotFoundException(
          `Lead with ID ${orderInfo.leadId} not found`,
        );
      }

      if (leadInfo.availableQty < orderInfo.quantity) {
        throw new NotFoundException(
          `Lead has only ${leadInfo.availableQty} quantity available`,
        );
      }

      ordersToSave.push({
        lead: { id: orderInfo.leadId },
        price: leadInfo.sellingPrice,
        quantity: orderInfo.quantity,
      });
    }

    const subtotal = ordersToSave.reduce(
      (acc, order) => acc + order.price * order.quantity,
      0,
    );

    const gst = Math.round(0.18 * subtotal * 100) / 100;
    const total = subtotal + gst;

    const bulkOrder = this.orderRepository.create({
      user: { id: userId },
      address: { id: addressId },
      razorPayId: razorpay_order_id,
      razorPayPaymentId: razorpay_payment_id,
      subtotal,
      gst,
      total,
      isBulkOrder: true,
      orderItems: ordersToSave,
    });

    try {
      const placedOrder = await this.orderRepository.save(bulkOrder);

      // clean up cart
      await this.cartRepository.delete({ user: { id: userId } });

      // update lead available quantity
      for (const orderInfo of orders) {
        const leadInfo = await this.leadRepository.findOne({
          where: { id: orderInfo.leadId },
        });
        if (leadInfo) {
          leadInfo.availableQty -= orderInfo.quantity;
          // Update status to sold
          if (leadInfo.availableQty === 0) {
            leadInfo.status = 'soldOut';
          }
          await this.leadRepository.save(leadInfo);
        }
      }

      return placedOrder;
    } catch (error) {
      console.error('Order Save Error:', error);
      throw new InternalServerErrorException('Failed to place order');
    }
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.orderRepository.remove(address);
  }
}
