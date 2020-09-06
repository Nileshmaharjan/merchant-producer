import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  UseInterceptors,
  UseFilters,
  Request,
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Query,
  Headers,
} from '@nestjs/common';
import { MerchantLogin } from '@dtos/MerchantLogin.dto';
import { MerchantLoginService } from '@modules/merchant-login/merchant-login.service';
import { MerchantLoginValidateDTO } from '@dtos/MerchantLoginValidate.dto';
import { SetSecurityQuestionDto } from '@dtos/SetSecurityQuestion.dto';
import { ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AllException } from '@common/filters/httexception.filter';
import { SetMpinDto } from '@dtos/SetMpin.dto';
import Axios from 'axios';
import { QRAmount } from '@dtos/QRamount.dto';
import { CreateNewTransaction } from '@dtos/CreateNewTransaction.dto';
import { MerchantTrnsactionDetails } from '@dtos/DateValidation.dto';

@Controller('merchant-login')
export class MerchantLoginController {
  constructor(private readonly merchantLoginService: MerchantLoginService) {}

  @ApiOperation({ title: 'Get otp for merchant login' })
  @ApiUseTags('Merchant Login')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post('getotp')
  async getOtp(@Body() merchantLoginDto: MerchantLogin) {
    return this.merchantLoginService.getOtp(merchantLoginDto);
  }

  @ApiOperation({ title: 'Validate otp for merchant login' })
  @ApiUseTags('Merchant Login')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post('validateotp')
  async validateOtp(
    @Body() validateMerchantLoginDto: MerchantLoginValidateDTO,
    @Headers() Device: any,
  ) {
    return this.merchantLoginService.validateOtp(
      validateMerchantLoginDto,
      Device.device,
    );
  }

  @ApiUseTags('Merchant Login')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Get('getAllSecurityQuestion')
  async getAllSecurityQuestion(
    @Request() request: Request,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    return this.merchantLoginService.getAllSecurityQuestion();
  }

  @ApiUseTags('Merchant Login')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post('setSecurityQuestion')
  async setSecurityQuestion(
    @Request() request: Request,
    @Body() setSecurityQuestion: SetSecurityQuestionDto,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    return this.merchantLoginService.setSecurityQuestion(
      setSecurityQuestion,
      getIdxAndCheckDeviceId,
    );
  }

  @ApiUseTags('Merchant Login')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post('setMpin')
  async setMPIN(
    @Body() mpin: SetMpinDto,
    @Request() request: Request,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    const checkIsMPINset = await this.merchantLoginService.checkMPINset(
      getIdxAndCheckDeviceId,
    );

    if (checkIsMPINset === 'True') {
      return new HttpException('MPIN already Set', HttpStatus.OK);
    } else if (checkIsMPINset === 'False') {
      const response = await Axios.post(`${process.env.SET_MPIN_URL}`, {
        mpin: mpin.mpin,
        confirm_mpin: mpin.confirm_mpin,
        idx: getIdxAndCheckDeviceId,
      });
      if (
        response.data.status === 200 &&
        response.data.response === 'Mobile Pin Set'
      ) {
        const response = await this.merchantLoginService.changeIsMPINset(
          getIdxAndCheckDeviceId,
        );
        return response;
        // throw new HttpException('Mobile Pin Set', HttpStatus.OK);
      } else if (
        response.data.status === 400 &&
        response.data.response === 'Bad Request'
      ) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      } else if (
        response.data.status === 400 &&
        response.data.response === 'Pin mismatch'
      ) {
        throw new HttpException('Pin Mismatch', HttpStatus.BAD_REQUEST);
      }
    }
  }

  @ApiUseTags('Merchant Login')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post('qr')
  async getQR(
    @Request() request: Request,
    @Body() amount: QRAmount,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    return this.merchantLoginService.QRcodeResponse(
      getIdxAndCheckDeviceId,
      amount,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @Post('verifyMpin')
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  async verifyMobilePinDuringPayment(
    @Request() request: Request,
    @Body() mpin: string,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }

    const response = await Axios.post(`${process.env.VERIFY_MPIN_URL}`, {
      data: mpin,
      idx: getIdxAndCheckDeviceId,
    });
    if (
      response.data.status === 200 &&
      response.data.response === 'Verified MPIN'
    ) {
      return new HttpException('Verified MPIN', HttpStatus.OK);
    } else if (
      response.data.status === 400 &&
      response.data.response === 'Invalid Credentials'
    ) {
      return new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    } else if (
      response.data.status === 404 &&
      response.data.response === 'Merchant Not Found'
    ) {
      return new HttpException('Merchant Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @Post('transaction')
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  async transaction(
    @Body() newTransaction: CreateNewTransaction,
    @Request() request: Request,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    const response = await Axios.post(`${process.env.MERCHANT_TRANSACTION}`, {
      new_transaction: newTransaction,
      initiator: 'Merchant',
      idx: getIdxAndCheckDeviceId,
    });
    if (response.status === 201 && response.data === 'True') {
      return new HttpException('New Transaction Created', HttpStatus.CREATED);
    }

    if (response.data === 'False') {
      return new HttpException(
        'Not Enough Credit Balance',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (response.data === 'Invalid Credentials') {
      return new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @Get('merchant-transaction-report')
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  async GetMerchantTransactionReport(
    @Query() date: MerchantTrnsactionDetails,
    @Request() request: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Headers() Device: any,
  ) {
    const header: any = request.headers;
    const token = header.authorization.split(' ')[1];
    const getIdxAndCheckDeviceId = await this.merchantLoginService.checkDeviceId(
      token,
      Device.device,
    );

    if (getIdxAndCheckDeviceId === 'Device ID Mismatch') {
      throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
    }
    const offset = limit * (page - 1);
    const response = await Axios.post(
      `${process.env.MERCHANT_TRANSACTION_REPORT}`,
      {
        date,
        limit,
        offset,
        page,
        initiator: 'Merchant',
        idx: getIdxAndCheckDeviceId,
      },
    );
    return response.data;
  }
}
