import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from 'src/dto/address.dto';
import { BaseService } from 'src/base/base.service';

@Injectable()
export class AddressService extends BaseService {
  private addressRepository: Repository<AddressEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.addressRepository = this.dataSource.getRepository(AddressEntity);
  }

  async findAll(userId: string) {
    return this.addressRepository.find({
      where: { id: userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!address) {
      throw new NotFoundException(`Address not found`);
    }
    return address;
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    const address = this.addressRepository.create({
      ...createAddressDto,
      user: { id: userId },
    });
    try {
      return await this.addressRepository.save(address);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create address');
    }
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, userId: string) {
    const address = await this.findOne(id, userId);
    const updatedAddress = this.addressRepository.merge(
      address,
      updateAddressDto,
    );
    return this.addressRepository.save(updatedAddress);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
  }
}
