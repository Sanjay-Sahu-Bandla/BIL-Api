import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';
import { AdminService } from '../admin/admin.service';
import { AdminController } from '../admin/admin.controller';
import { FavoriteController } from './favorite/favorite.controller';
import { FavoriteService } from './favorite/favorite.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';

@Module({
  providers: [
    UserService,
    AdminService,
    AddressService,
    FavoriteService,
    CartService,
    OrderService,
  ],
  controllers: [
    UserController,
    AdminController,
    AddressController,
    FavoriteController,
    CartController,
    OrderController,
  ],
})
export class UserModule {}
