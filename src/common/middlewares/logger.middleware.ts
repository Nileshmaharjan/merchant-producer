import { Injectable, NestMiddleware, Logger, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { isObjectEmpty } from '@utils/helperFunctions.utils';
import validator from 'validator';
import { isUUID } from '@nestjs/common/utils/is-uuid';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLog');
  use(req: Request, res: Response, next: Function) {
    if (!isObjectEmpty(req.query)) {
      this.logger.log(`Query: ${JSON.stringify(req.query)}`);
    }
    if (!isObjectEmpty(req.params)) {
      this.logger.log(`Params: ${JSON.stringify(req.params)}`);
    }
    if (!isObjectEmpty(req.body)) {
      this.logger.log(`Body: ${JSON.stringify(req.body)}`);
    }
    next();
  }
}
