import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BaseController } from 'src/base/base.controller';
import { ADMIN_MESSAGES } from 'src/constants/message.constants';
import { JwtService } from '@nestjs/jwt';
import { SigninAdminDto, SignUpAdminDto } from 'src/dto/admin.dto';

@Controller('admin')
export class AdminController extends BaseController {
  constructor(
    public adminService: AdminService,
    private jwtService: JwtService,
  ) {
    super();
  }
  @Post('sign-in')
  async logAdmin(@Body() payload: SigninAdminDto) {
    const existingAdmin = await this.adminService.findOne(payload.email);

    if (!existingAdmin) {
      throw new NotFoundException(ADMIN_MESSAGES.NOT_FOUND);
    }

    const isPasswordValid = await this.adminService.validatePassword(
      payload.password,
      existingAdmin.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException(ADMIN_MESSAGES.INVALID_CREDENTIALS);
    }

    const userData = {
      id: existingAdmin.id,
      email: existingAdmin.email,
    };
    const token = await this.jwtService.signAsync({
      sub: existingAdmin.id,
      ...userData,
    });

    return this.sendResponse(
      { ...userData, accessToken: token },
      ADMIN_MESSAGES.SIGN_IN,
    );
  }

  @Post('sign-up')
  async registerAdmin(@Body() payload: SignUpAdminDto) {
    const existingUser = await this.adminService.findOne(payload.email);
    if (existingUser) {
      throw new ConflictException(ADMIN_MESSAGES.ADMIN_EXISTS);
    }

    const newUser = await this.adminService.create(payload);
    const userData = {
      id: newUser.id,
      email: newUser.email,
    };
    const token = await this.jwtService.signAsync({
      sub: newUser.id,
      ...userData,
    });

    return this.sendResponse(
      { ...userData, accessToken: token },
      ADMIN_MESSAGES.SIGN_UP,
    );
  }
}
