import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { JwtUserGuard } from 'src/guards/auth/user.guard';
import { OrderService } from './order.service';
import { CreateOrdersDto } from 'src/dto/order.dto';

@UseGuards(JwtUserGuard)
@Controller('order')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
    super();
  }

  @Get()
  async getOrders(@Req() req) {
    const userId = req.user.id;
    const cartItems = await this.orderService.findAll(userId);
    return this.sendResponse(cartItems);
  }

  @Post()
  async addOrder(@Body() createBulkOrderDto: CreateOrdersDto) {
    const newCartItem = await this.orderService.create(createBulkOrderDto);
    return this.sendResponse(newCartItem, 'Order request created successfully');
  }

  @Post('confirm')
  async confirmPayment(@Body() body, @Req() req) {
    const isValid = this.orderService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Save order like before (with razorPayId, etc.)
    const orderStatus = await this.orderService.saveOrderToDb(
      body,
      req.user.id,
    );
    return this.sendResponse(orderStatus, 'Order placed successfully');
  }
}
