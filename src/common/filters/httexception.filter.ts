import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class AllException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let { message } = exception;
    if (status === HttpStatus.BAD_REQUEST || status === HttpStatus.NOT_FOUND) {
      if (message.message) {
        message = message.message.map(el => {
          return el.constraints;
        });
        message = Object.values(Object.assign({}, ...message));
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
