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

@Module({
  providers: [
    UserService,
    AdminService,
    AddressService,
    FavoriteService,
    OrderService,
  ],
  controllers: [
    UserController,
    AdminController,
    AddressController,
    FavoriteController,
    OrderController,
  ],
})
export class UserModule {}
