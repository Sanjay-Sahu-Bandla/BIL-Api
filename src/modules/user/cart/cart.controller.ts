import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { BaseController } from 'src/base/base.controller';
import { JwtUserGuard } from 'src/guards/auth/user.guard';
import { CreateCartDto } from 'src/dto/cart.dto';

@UseGuards(JwtUserGuard)
@Controller('cart')
export class CartController extends BaseController {
  constructor(private readonly cartService: CartService) {
    super();
  }

  @Get()
  async getCart(@Req() req) {
    const userId = req.user.id;
    const cartItems = await this.cartService.findAll(userId);
    return this.sendResponse(cartItems, 'Cart items retrieved successfully');
  }

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto, @Req() req) {
    const userId = req.user.id;
    const newCartItem = await this.cartService.create(createCartDto, userId);
    return this.sendResponse(newCartItem, 'Lead added to cart successfully');
  }

  @Delete(':id')
  async removeFromCart(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.cartService.remove(id, userId);
    return this.sendResponse(null, 'Lead removed from the cart successfully');
  }
}
