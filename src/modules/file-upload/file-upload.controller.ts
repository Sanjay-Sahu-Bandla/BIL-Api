import {
  Body,
  ConflictException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('file-upload')
export class FileUploadController extends BaseController {
  constructor() {
    console.log('con');
    super();
  }

  @Post()
  @UseInterceptors(FileInterceptor('leadImage'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new ConflictException('leadImage is required.');
    }

    const leadsFolder = path.join(__dirname, '../../../temp/leads');
    if (!fs.existsSync(leadsFolder)) {
      fs.mkdirSync(leadsFolder, { recursive: true });
    }

    const filePath = path.join(leadsFolder, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return this.sendResponse(
      { filePath: file.originalname },
      'File uploaded successfully.',
    );
  }
}
