import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';
import { AdminService } from '../admin/admin.service';
import { AdminController } from '../admin/admin.controller';

@Module({
  providers: [UserService, AdminService, AddressService],
  controllers: [UserController, AdminController, AddressController],
})
export class UserModule {}
