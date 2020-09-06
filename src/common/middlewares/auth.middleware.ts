import {
  Injectable,
  NestMiddleware,
  Logger,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isObjectEmpty } from '@utils/helperFunctions.utils';
import Axios, { AxiosResponse } from 'axios';
import { isUUID } from 'validator';

@Injectable()
export class AuthMiddleWare implements NestMiddleware {
  private readonly logger = new Logger('RequestLog');
  async use(req: Request, res: Response, next: Function) {
    try {
      if (!isObjectEmpty(req.headers.authorization)) {
        let url = req.originalUrl;
        const urlArr = url.split('?');
        if (urlArr.length > 0) {
          url = urlArr[0];
        }
        let stripSlash = 1;
        const routeArr = url.split('/');
        let finalRouteParam = '';
        if (routeArr.length > 0) {
          finalRouteParam = routeArr[routeArr.length - 1];
          if (finalRouteParam === '') {
            stripSlash = 2;
            finalRouteParam = routeArr[routeArr.length - 2];
          }
        } else {
          finalRouteParam = routeArr.join('/');
        }

        if (isUUID(finalRouteParam, 'all')) {
          if (stripSlash === 2) {
            finalRouteParam = finalRouteParam + '/';
          }
          const requestUrl = url.replace(finalRouteParam, ':idx');
          const jwtData = await Axios.post(`${process.env.AUTHENTICATER_URL}`, {
            data: req.headers.authorization,
            url: requestUrl,
            method: req.method,
          });
          process.env.idx = jwtData.data.idx;
        } else {
          const jwtData = await Axios.post(`${process.env.AUTHENTICATER_URL}`, {
            data: req.headers.authorization,
            url,
            method: req.method,
          });
          process.env.idx = jwtData.data.idx;
        }
      }
      next();
    } catch (e) {
      console.log(e.message);
      if (e.response.status === 500) {
        throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
      }

      if (
        e.response.data.statusCode === 400 &&
        e.response.data.message === 'Not accessible routes'
      ) {
        throw new HttpException(
          'Not accessible routes',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
