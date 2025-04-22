import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply rate limiting middleware
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  // Apply rate limiting middleware
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        message: 'Too many requests from your IP, please try again later.',
        statusCode: 429,
      },
    }),
  );
  app.useGlobalPipes(new ValidationPipe({}));
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
