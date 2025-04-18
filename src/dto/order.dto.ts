import { IsNotEmpty, IsUUID, IsInt, IsString } from 'class-validator';

export class OrderDto {
  @IsNotEmpty()
  @IsUUID()
  leadId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;
}

export class CreateOrderDto extends OrderDto {
  @IsString()
  @IsNotEmpty()
  razorPayId?: string;
}
export class CreateBulkOrdersDto {
  @IsNotEmpty()
  orders: CreateOrderDto[];

  @IsString()
  @IsNotEmpty()
  razorPayId?: string;
}
