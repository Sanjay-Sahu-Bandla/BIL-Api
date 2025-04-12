import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateTagDto {
  @IsNotEmpty() name: string;
}

export class CreateTagDbDto extends CreateTagDto {
  @IsNotEmpty() userId: string;
}

export class UpdateTagDto extends CreateTagDto {}

export class TagResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
