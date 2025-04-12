import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';

@Module({
  providers: [UserService, AddressService],
  controllers: [UserController, AddressController],
})
export class UserModule {}
