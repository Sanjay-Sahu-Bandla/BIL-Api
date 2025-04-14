import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BaseService {
  protected logger = new Logger();
}
