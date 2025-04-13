import { IsNotEmpty } from 'class-validator';

export class SigninAdminDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
export class SignUpAdminDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  accessCode: string;
}
