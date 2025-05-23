import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, SigninUserDto } from 'src/dto/user.dto';
import { BaseController } from 'src/base/base.controller';
import { USER_MESSAGES } from 'src/constants/message.constants';
import { JwtService } from '@nestjs/jwt';
import { JwtUserGuard } from 'src/guards/auth/user.guard';

@Controller('user')
export class UserController extends BaseController {
  constructor(
    public userService: UserService,
    private jwtService: JwtService,
  ) {
    super();
  }
  @Post('sign-in')
  async logUser(@Body() payload: SigninUserDto) {
    const existingUser = await this.userService.findOne(payload.email);

    if (!existingUser) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    const isPasswordValid = await this.userService.validatePassword(
      payload.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException(USER_MESSAGES.INVALID_CREDENTIALS);
    }

    const userData = {
      id: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    };
    // Fetch list of lead IDs bought by the user
    const purchasedLeadIds = await this.userService.getUserLeadIds(
      existingUser.id,
    );

    const token = await this.jwtService.signAsync({
      sub: existingUser.id,
      ...userData,
    });

    return this.sendResponse(
      { ...userData, accessToken: token, purchasedLeadIds },
      USER_MESSAGES.SIGN_IN,
    );
  }

  @Post('sign-up')
  async registerUser(@Body() payload: CreateUserDto) {
    const existingUser = await this.userService.findOne(payload.email);
    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.USER_EXISTS);
    }

    const newUser = await this.userService.create(payload);
    const userData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };

    // Fetch user stats
    const stats = await this.userService.getUserStats(newUser.id);
    // Fetch list of lead IDs bought by the user
    const purchasedLeadIds = await this.userService.getUserLeadIds(newUser.id);

    const token = await this.jwtService.signAsync({
      sub: newUser.id,
      ...userData,
    });

    return this.sendResponse(
      { ...userData, accessToken: token, stats, purchasedLeadIds },
      USER_MESSAGES.SIGN_UP,
    );
  }

  @UseGuards(JwtUserGuard)
  @Get('stats')
  async getUserStats(@Req() req) {
    const stats = await this.userService.getUserStats(req.user.id);
    return this.sendResponse(stats);
  }

  @UseGuards(JwtUserGuard)
  @Delete()
  async deleteUser(@Req() req) {
    // Implement soft delete
    const response = await this.userService.delete(req.user.id);
    if (response) {
      return this.sendResponse({}, USER_MESSAGES.DELETED);
    } else {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }
  }
}
