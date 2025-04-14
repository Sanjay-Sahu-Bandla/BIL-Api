import { Controller } from '@nestjs/common';
import { IApiResponse } from 'src/interfaces/app.interface';

@Controller('base')
export class BaseController {
  protected sendResponse(
    data: any,
    message?: string,
    meta?: { [key: string]: any },
  ): IApiResponse {
    return {
      message,
      data,
      meta,
    };
  }
}
