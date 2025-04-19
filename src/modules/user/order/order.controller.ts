import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
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
  async addOrder(@Body() createBulkOrderDto: CreateOrdersDto, @Req() req) {
    const userId = req.user.id;
    const newCartItem = await this.orderService.create(
      createBulkOrderDto,
      userId,
    );
    return this.sendResponse(newCartItem, 'Order placed successfully');
  }
}
