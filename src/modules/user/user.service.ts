import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { CreateUserDto } from 'src/dto/user.dto';
import { BaseService } from 'src/base/base.service';
// import * as bcrypt from 'bcrypt';
// import bcrypt from 'bcrypt'
import * as bcrypt from 'bcrypt';
import { USER_MESSAGES } from 'src/constants/message.constants';
import { CartEntity } from 'src/entities/cart.entity';
import { FavoriteEntity } from 'src/entities/favorite.entity';
import { OrderEntity } from 'src/entities/order.entity';

@Injectable()
export class UserService extends BaseService {
  private userRepository: Repository<UserEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.userRepository = this.dataSource.getRepository(UserEntity);
  }
  async create(createUser: CreateUserDto): Promise<UserEntity> {
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(createUser.password, 10);
      createUser.password = hashedPassword;

      const user = this.userRepository.create(createUser);
      return await this.userRepository.save(user);
    } catch (err) {
      if (err.code == 'ER_DUP_ENTRY') {
        throw new HttpException(USER_MESSAGES.USER_EXISTS, HttpStatus.CONFLICT);
      }
      this.logger.error(err.message, err.stack);
      throw new InternalServerErrorException(
        'Something went wrong, Try again!',
      );
    }
  }

  findOne(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserStats(userId: string) {
    try {
      const totalOrders = await this.dataSource
        .getRepository(OrderEntity) // Replace 'OrderEntity' with the actual Order entity
        .count({ where: { user: { id: userId } } });

      const totalWishlistItems = await this.dataSource
        .getRepository(FavoriteEntity) // Replace 'FavoriteEntity' with the actual Favorite entity
        .count({ where: { user: { id: userId } } });

      const totalCartItems = await this.dataSource
        .getRepository(CartEntity) // Replace 'CartItemEntity' with the actual CartItem entity
        .count({ where: { user: { id: userId } } });

      return {
        totalOrders,
        totalWishlistItems,
        totalCartItems,
      };
    } catch (err) {
      this.logger.error(err.message, err.stack);
      throw new InternalServerErrorException(
        'Failed to fetch user stats, Try again!',
      );
    }
  }

  async getUserLeadIds(userId: string): Promise<string[]> {
    try {
      const orders = await this.dataSource
        .getRepository(OrderEntity)
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .where('order.userId = :userId', { userId })
        .select('orderItem.leadId')
        .getMany();

      const leadIds = orders
        .flatMap((order) => order.orderItems)
        .map((orderItem) => orderItem.lead)
        .map((lead) => lead.id);

      return Array.from(new Set(leadIds)); // Remove duplicates if any
    } catch (err) {
      this.logger.error(err.message, err.stack);
      throw new InternalServerErrorException(
        'Failed to fetch user lead IDs, Try again!',
      );
    }
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    return user ? this.userRepository.delete(id) : null;
  }
}
