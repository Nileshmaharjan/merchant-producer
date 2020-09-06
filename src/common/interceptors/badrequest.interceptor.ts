import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message.message;

    // const updatedMessage = message.map(el => {
    //   return {
    //     property: el.property,
    //     value: el.value ? el.value : 'null',
    //     message: el.constraints,
    //   };
    // });

    response
      .status(status)
      // you can manipulate the response here
      .json({
        statusCode: status,
        message: message,
      });
  }
}
