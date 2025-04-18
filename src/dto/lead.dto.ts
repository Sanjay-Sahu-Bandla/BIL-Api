import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @IsNotEmpty()
  @IsString()
  propertyStatus: string;

  @IsNotEmpty()
  @IsString()
  serviceRequiredOn: string;

  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  requirement: string;

  @IsNotEmpty()
  @IsString()
  tags: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  discountPrice: number;

  @IsNotEmpty()
  @IsString()
  addressType: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}

export class UpdateLeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @IsNotEmpty()
  @IsString()
  propertyStatus: string;

  @IsNotEmpty()
  @IsString()
  serviceRequiredOn: string;

  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  requirement: string;

  @IsNotEmpty()
  @IsString()
  tags: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  discountPrice: number;

  @IsNotEmpty()
  @IsString()
  addressType: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
