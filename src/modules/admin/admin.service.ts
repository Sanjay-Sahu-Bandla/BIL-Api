import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import * as bcrypt from 'bcrypt';
import { ADMIN_MESSAGES } from 'src/constants/message.constants';
import { AdminEntity } from 'src/entities/admin.entity';
import { SignUpAdminDto } from 'src/dto/admin.dto';

@Injectable()
export class AdminService extends BaseService {
  private adminRepository: Repository<AdminEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.adminRepository = this.dataSource.getRepository(AdminEntity);
  }
  async create(createAdmin: SignUpAdminDto): Promise<AdminEntity> {
    try {
      const hashedAccessCode =
        '$2a$12$rX5CqU7Orxc0HiuTDD6N7eGnUV/cnM74HDYVUhO7q4shkdtf8Sbxq'; // bil-code-anil-om-sanjay
      // Hash the password before saving
      const isValidCode = await bcrypt.compare(
        createAdmin.accessCode,
        hashedAccessCode,
      );
      if (!isValidCode) {
        throw new HttpException(ADMIN_MESSAGES.INVALID_ACCESS_CODE, 403);
      }
      const hashedPassword = await bcrypt.hash(createAdmin.password, 10);
      createAdmin.password = hashedPassword;

      const user = this.adminRepository.create(createAdmin);
      return await this.adminRepository.save(user);
    } catch (err) {
      if (err.code == 'ER_DUP_ENTRY') {
        throw new HttpException(
          ADMIN_MESSAGES.ADMIN_EXISTS,
          HttpStatus.CONFLICT,
        );
      }
      this.logger.error(err.message, err.stack);
      throw new InternalServerErrorException(
        'Something went wrong, Try again!',
      );
    }
  }

  async findOne(email: string) {
    return this.adminRepository.findOne({ where: { email } });
  }

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
