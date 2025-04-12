import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { BaseController } from 'src/base/base.controller';
import { CreateAddressDto, UpdateAddressDto } from 'src/dto/address.dto';

@Controller('address')
export class AddressController extends BaseController {
  constructor(private readonly addressService: AddressService) {
    super();
  }

  @Get()
  async getAllAddresses() {
    const addresses = await this.addressService.findAll();
    return this.sendResponse(addresses, 'Addresses retrieved successfully');
  }

  @Get(':id')
  async getAddressById(@Param('id') id: string) {
    const address = await this.addressService.findOne(id);
    return this.sendResponse(address, 'Address retrieved successfully');
  }

  @Post()
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    const newAddress = await this.addressService.create(createAddressDto);
    return this.sendResponse(newAddress, 'Address created successfully');
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const updatedAddress = await this.addressService.update(
      id,
      updateAddressDto,
    );
    return this.sendResponse(updatedAddress, 'Address updated successfully');
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string) {
    await this.addressService.remove(id);
    return this.sendResponse(null, 'Address deleted successfully');
  }
}
