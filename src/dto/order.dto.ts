import { IsNotEmpty, IsUUID, IsInt, IsString } from 'class-validator';

export class OrderDto {
  @IsNotEmpty()
  @IsUUID()
  leadId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}
export class CreateOrdersDto {
  @IsNotEmpty()
  orders: OrderDto[];

  @IsString()
  @IsNotEmpty()
  razorPayId?: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;
}
