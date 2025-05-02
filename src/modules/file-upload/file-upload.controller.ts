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
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Controller('file-upload')
export class FileUploadController extends BaseController {
  private s3Client: S3Client;

  constructor() {
    super();
    this.s3Client = new S3Client({ region: process.env.AWS_REGION }); // Replace 'your-region' with your AWS region
  }

  @Post()
  @UseInterceptors(FileInterceptor('leadImage'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new ConflictException('leadImage is required.');
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME; // Replace with your S3 bucket name
    const key = `temp/${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);

      return this.sendResponse(
        { filePath: key },
        'File uploaded successfully.',
      );
    } catch (error) {
      console.error('Failed to upload file to S3:', error);
      throw new ConflictException('Failed to upload file to S3.');
    }
  }
}
