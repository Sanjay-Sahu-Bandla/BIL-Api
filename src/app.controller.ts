import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { IsNotEmpty } from 'class-validator';

class CreateCatDto {
  @IsNotEmpty()
  name: string;
  age: number;
  breed: string;
}

class loginInputs {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

@Controller()
@UsePipes(new ValidationPipe({ stopAtFirstError: true })) // Stop after first error
export class AppController {
  constructor(private readonly appService: AppService) {}
}
