import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({})
  title: string;

  @IsNotEmpty({})
  content: string;

  labels: string[];

  @IsNotEmpty({})
  website: string;

  @IsNotEmpty({})
  webpageUrl: string;
}

export class UpdateNoteDto extends PickType(CreateNoteDto, [
  'content',
  'labels',
]) {}
