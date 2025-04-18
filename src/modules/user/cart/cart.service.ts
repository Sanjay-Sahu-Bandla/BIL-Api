import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { CartEntity } from 'src/entities/cart.entity';
import { CreateCartDto } from 'src/dto/cart.dto';

@Injectable()
export class CartService extends BaseService {
  private cartRepository: Repository<CartEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.cartRepository = this.dataSource.getRepository(CartEntity);
  }

  async findAll(userId: string) {
    return await this.cartRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['lead'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(leadId: string, userId: string) {
    const address = await this.cartRepository.findOne({
      where: { lead: { id: leadId }, user: { id: userId } },
      relations: ['user'],
    });
    if (!address) {
      throw new NotFoundException(`Item not found in the cart`);
    }
    return address;
  }

  async create(createCartDto: CreateCartDto, userId: string) {
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        lead: { id: createCartDto.leadId },
      },
    });

    if (existingCartItem) {
      throw new InternalServerErrorException('Item already exists in the cart');
    }

    const cartItem = this.cartRepository.create({
      ...createCartDto,
      user: { id: userId },
      lead: { id: createCartDto.leadId },
    });

    try {
      return await this.cartRepository.save(cartItem);
    } catch (error) {
      throw new InternalServerErrorException('Failed to add item to cart');
    }
  }

  async remove(leadId: string, userId: string) {
    const address = await this.findOne(leadId, userId);
    await this.cartRepository.remove(address);
  }
}
