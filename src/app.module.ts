import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from './datasource/typeorm.module';
import { UserModule } from './modules/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ValidationMessageInterceptor } from './common/interceptors/validation-message.interceptor';
import { BaseController } from './base/base.controller';
import { BaseService } from './base/base.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONSTANTS } from './config/app.constants';
import { FileUploadController } from './modules/file-upload/file-upload.controller';
import { LeadController } from './modules/lead/lead.controller';
import { LeadService } from './modules/lead/lead.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: APP_CONSTANTS.JWT_SECRET_KEY,
      signOptions: { expiresIn: '7d' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets/',
      exclude: ['/api*'],
    }),
  ],
  controllers: [
    AppController,
    BaseController,
    FileUploadController,
    LeadController,
  ],
  providers: [
    AppService,
    LeadService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ValidationMessageInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    BaseService,
  ],
})
export class AppModule {}
