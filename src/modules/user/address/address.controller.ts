import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { BaseController } from 'src/base/base.controller';
import { CreateAddressDto, UpdateAddressDto } from 'src/dto/address.dto';
import { JwtUserGuard } from 'src/guards/auth/user.guard';

@UseGuards(JwtUserGuard)
@Controller('address')
export class AddressController extends BaseController {
  constructor(private readonly addressService: AddressService) {
    super();
  }

  @Get()
  async getAllAddresses(@Req() req) {
    const userId = req.user.id;
    const addresses = await this.addressService.findAll(userId);
    return this.sendResponse(addresses, 'Addresses retrieved successfully');
  }

  // @Get(':id')
  // async getAddressById(@Param('id') id: string, @Req() req) {
  //   const userId = req.user.id;
  //   const address = await this.addressService.findOne(id, userId);
  //   return this.sendResponse(address, 'Address retrieved successfully');
  // }

  @Post()
  async createAddress(@Body() createAddressDto: CreateAddressDto, @Req() req) {
    const userId = req.user.id;
    const newAddress = await this.addressService.create(
      createAddressDto,
      userId,
    );
    return this.sendResponse(newAddress, 'Address created successfully');
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const updatedAddress = await this.addressService.update(
      id,
      updateAddressDto,
      userId,
    );
    return this.sendResponse(updatedAddress, 'Address updated successfully');
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.addressService.remove(id, userId);
    return this.sendResponse(null, 'Address deleted successfully');
  }
}
