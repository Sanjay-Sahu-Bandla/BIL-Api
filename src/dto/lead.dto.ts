import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

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
  @IsString()
  budget: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  requirement: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  whatsAppMobile: string;

  @IsNotEmpty()
  @IsNumber()
  actualPrice: number;

  @IsNotEmpty()
  @IsNumber()
  discountPrice: number;

  @IsNotEmpty()
  @IsNumber()
  sellingPrice: number;

  @IsNotEmpty()
  @IsNumber()
  stockQty: number;

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
  @IsString()
  budget: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  requirement: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  whatsAppMobile: string;

  @IsNotEmpty()
  @IsNumber()
  actualPrice: number;

  @IsNotEmpty()
  @IsNumber()
  discountPrice: number;

  @IsNotEmpty()
  @IsNumber()
  sellingPrice: number;

  @IsNotEmpty()
  @IsNumber()
  stockQty: number;

  @IsNotEmpty()
  @IsString()
  addressType: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
