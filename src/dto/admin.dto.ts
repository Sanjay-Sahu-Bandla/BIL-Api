import { IsNotEmpty } from 'class-validator';

export class SigninAdminDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
