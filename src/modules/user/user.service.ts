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

  async delete(id: string) {
    const user = await this.findOne(id);
    return user ? this.userRepository.delete(id) : null;
  }
}
