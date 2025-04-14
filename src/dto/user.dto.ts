import { IsNotEmpty } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
