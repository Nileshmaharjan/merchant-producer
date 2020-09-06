import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
  Request,
  Headers,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseFilters,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantDevice } from '@entities/MerchantDevice';
import { Repository, getManager } from 'typeorm';
import { MerchantLogin } from '@dtos/MerchantLogin.dto';
import {
  genRandom,
  generateRandomUUID,
  parseJwt,
  hashString,
  verifyHash,
} from '@utils/helperFunctions.utils';
import { MerchantLoginValidateDTO } from '@dtos/MerchantLoginValidate.dto';
import config from '@config/index';
import { ClientKafka } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { MerchantSecurityQuestion } from '@entities/MerchantSecurityQuestion';
import { MerchantAnswers } from '@entities/MerchantAnswers';
import { MerchantProfile } from '@entities/MerchantProfile';
import { MerchantWallet } from '@entities/MerchantWallet';
import { isObjectEmpty } from '@utils/helperFunctions.utils';
import * as argon from 'argon2';

@Injectable()
export class MerchantLoginService {
  private readonly logger: Logger = new Logger('MerchantLoginService');
  constructor(
    @InjectRepository(MerchantDevice)
    private readonly merchantDeviceRepo: Repository<MerchantDevice>,
    @InjectRepository(MerchantSecurityQuestion)
    private readonly merchantSecurityQuestionRepo: Repository<
      MerchantSecurityQuestion
    >,
    @InjectRepository(MerchantAnswers)
    private readonly merchantAnswersRepo: Repository<MerchantAnswers>,
    @InjectRepository(MerchantProfile)
    private readonly merchantProfileRepo: Repository<MerchantProfile>,
    @InjectRepository(MerchantWallet)
    private readonly merchantWalletRepo: Repository<MerchantWallet>,
    @Inject('kafka') private readonly kafka: ClientKafka,
    private readonly jwtService: JwtService,
  ) {}

  async getOtp(merchantLoginDto: MerchantLogin) {
    const Otpcode = genRandom(); // -> To be used later !
    const authToken = generateRandomUUID(); // -> To be used later

    const merchantProfileExist = await this.merchantProfileRepo.findOne({
      where: {
        mobile_number: merchantLoginDto.mobile_number,
      },
    });

    if (!merchantProfileExist) {
      throw new HttpException('Merchant Not Found', HttpStatus.NOT_FOUND);
    }

    if (merchantProfileExist.is_blocked === true) {
      throw new HttpException('User Blocked', HttpStatus.BAD_REQUEST);
    }

    const merchant = await this.merchantDeviceRepo.findOne({
      where: {
        mobile_number: merchantLoginDto.mobile_number,
        phone_ext: merchantLoginDto.phone_ext,
      },
    });

    if (merchant) {
      if (merchant.deviceid !== merchantLoginDto.deviceid) {
        throw new HttpException('Device ID mismatch', HttpStatus.BAD_REQUEST);
      }

      if (merchant.total_attempt >= '3') {
        throw new HttpException('User Blocked', HttpStatus.BAD_REQUEST);
      }
      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(MerchantDevice)
          .where('mobile_number = :mobile_number', {
            mobile_number: merchantLoginDto.mobile_number,
          })
          .andWhere('phone_ext = :phone_ext', {
            phone_ext: merchantLoginDto.phone_ext,
          })
          .set({
            ...merchantLoginDto,
            otp: '123456',
            otp_status: false,
            total_attempt: '0',
            otp_created_at: new Date(),
          })
          .execute();
      });
      throw new HttpException('Otp Sent', HttpStatus.OK);
    } else {
      await getManager().transaction(async transactionalEntityManager => {
        const device = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(MerchantDevice)
          .values([
            {
              otp: '123456',
              otp_created_at: new Date(),
              merchant_id: merchantProfileExist.id.toString(),
              ...merchantLoginDto,
            },
          ])
          .execute();
      });
      throw new HttpException('Otp Sent', HttpStatus.OK);
    }
  }

  async validateOtp(
    validateMerchantLoginDto: MerchantLoginValidateDTO,
    deviceId,
  ) {
    const merchant = await this.merchantDeviceRepo.findOne({
      where: {
        mobile_number: validateMerchantLoginDto.mobile_number,
        is_obsolete: false,
      },
    });

    const merchantProfileExist = await this.merchantProfileRepo.findOne({
      where: {
        mobile_number: validateMerchantLoginDto.mobile_number,
      },
    });

    if (!merchantProfileExist) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (merchantProfileExist.is_blocked === true) {
      throw new HttpException('User Blocked', HttpStatus.BAD_REQUEST);
    }

    if (merchant) {
      if (merchant.otp_status === true) {
        throw new HttpException('Otp Already Used', HttpStatus.BAD_REQUEST);
      }

      if (merchant.total_attempt >= '3') {
        throw new HttpException('User Blocked', HttpStatus.BAD_REQUEST);
      }

      const appMerchant = await this.merchantDeviceRepo.findOne({
        where: {
          otp: validateMerchantLoginDto.otp,
          mobile_number: validateMerchantLoginDto.mobile_number,
        },
      });

      if (!appMerchant) {
        const attempt = +merchant.total_attempt + 1;

        await getManager().transaction(async transactionalEntityManager => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(MerchantDevice)
            .where('mobile_number = :mobile_number', {
              mobile_number: validateMerchantLoginDto.mobile_number,
            })
            .andWhere('phone_ext = :phone_ext', {
              phone_ext: validateMerchantLoginDto.phone_ext,
            })
            .set({
              total_attempt: attempt.toString(),
            })
            .execute();
        });

        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      if (appMerchant) {
        if (deviceId === undefined) {
          throw new HttpException('Device Id Missing', HttpStatus.BAD_REQUEST);
        }

        const device_id = deviceId.split(' ')[1];

        if (appMerchant.deviceid !== device_id) {
          throw new HttpException('Device Id Mismatch', HttpStatus.BAD_REQUEST);
        }

        let time =
          new Date().valueOf() - new Date(appMerchant.otp_created_at).valueOf();
        time = Math.round(((time % 86400000) % 3600000) / 60000);

        if (time > config.OtpExpiryInMintues) {
          throw new HttpException('OtpExpired', HttpStatus.BAD_REQUEST);
        }

        const payload = {
          mobile_number: appMerchant.mobile_number,
          id: merchantProfileExist.id,
          idx: merchantProfileExist.idx,
        };
        const accesstoken = await this.jwtService.sign(payload);

        await getManager().transaction(async transactionalEntityManager => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(MerchantDevice)
            .where('mobile_number = :mobile_number', {
              mobile_number: validateMerchantLoginDto.mobile_number,
            })
            .andWhere('phone_ext = :phone_ext', {
              phone_ext: validateMerchantLoginDto.phone_ext,
            })
            .set({
              otp_status: true,
              total_attempt: '0',
            })
            .execute();
        });
        // throw new HttpException('Successfully signed in', accesstoken)
        return {
          message: 'Successfully signed in',
          accesstoken,
          is_security_set: merchantProfileExist.is_security_set,
          is_mpin_set: merchantProfileExist.is_mpin_set,
          first_name: merchantProfileExist.company_name,
          idx: merchantProfileExist.idx,
          status: HttpStatus.OK,
        };
      }
    } else if (!merchant) {
      throw new HttpException('Merchant doesnot exist', HttpStatus.NOT_FOUND);
    }
  }

  async getAllSecurityQuestion() {
    const questionArray = [];
    const result = await this.merchantSecurityQuestionRepo.find({
      where: {
        created_by: 'Superadmin',
      },
      select: ['id', 'questions'],
    });

    result.forEach(val => {
      questionArray.push(val.questions);
    });
    return questionArray;
  }

  async setSecurityQuestion(setSecurityQuestion, idx) {
    const { ...merchantProfileExist } = await this.merchantProfileRepo.findOne({
      where: {
        idx,
      },
      select: ['id', 'is_security_set'],
    });

    const data = [];

    if (setSecurityQuestion.answers.length !== 5) {
      return new HttpException(
        'All five questions must be answerd',
        HttpStatus.BAD_REQUEST,
      );
    }

    setSecurityQuestion.answers.forEach((val, key) => {
      data.push({
        merchant_id: merchantProfileExist.id,
        question_id: key + 1,
        answer: val,
      });
    });

    if (merchantProfileExist.is_security_set === false) {
      await this.merchantAnswersRepo.save(data);
      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(MerchantProfile)
          .where('id = :id', {
            id: merchantProfileExist.id,
          })
          .set({
            is_security_set: true,
          })
          .execute();
      });
      return {
        message: 'Security answers stored',
        is_security_set: true,
        status: HttpStatus.OK,
      };
    } else if (merchantProfileExist.is_security_set === true) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < data.length; i++) {
        await getManager().transaction(async transactionalEntityManager => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(MerchantAnswers)
            .where('merchant_id = :merchant_id', {
              merchant_id: merchantProfileExist.id,
            })
            .andWhere('question_id = :question_id', {
              question_id: i + 1, // matching question number to update data
            })
            .set({
              answer: data[i].answer,
            })
            .execute();
        });
      }
      return {
        message: 'Security answers updated',
        is_security_set: true,
        status: HttpStatus.OK,
      };
    }
  }

  async QRcodeResponse(idx, amount) {
    const merchantProfileExist = await this.merchantProfileRepo.findOne({
      where: {
        idx,
      },
      select: ['idx', 'mobile_number', 'company_name'],
    });
    if (merchantProfileExist) {
      if (
        amount.amount === '0' ||
        amount.amount === '' ||
        amount.amount < '0'
      ) {
        throw new HttpException(
          'Amount should be greater than 0',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (isObjectEmpty(amount) === false) {
        return {
          merchantProfileExist,
          amount,
          status: HttpStatus.OK,
        };
      } else {
        return {
          merchantProfileExist,
          status: HttpStatus.OK,
        };
      }
    }
  }

  async checkMPINset(idx) {
    const checkMpinStatus = await this.merchantProfileRepo.findOne({
      idx,
    });

    if (checkMpinStatus.is_mpin_set === true) {
      return 'True';
    } else {
      return 'False';
    }
  }

  async changeIsMPINset(Idx) {
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(MerchantProfile)
        .where('idx = :idx', {
          idx: Idx,
        })
        .set({
          is_mpin_set: true,
        })
        .execute();
    });
    return new HttpException('MPIN set', HttpStatus.OK);
  }

  async checkDeviceId(token, deviceId) {
    if (deviceId === undefined) {
      throw new HttpException('Device ID missing', HttpStatus.BAD_REQUEST);
    }
    const device_id = deviceId.split(' ')[1];
    const { idx } = await parseJwt(token);
    const merchantProfileExist = await this.merchantProfileRepo.findOne({
      where: {
        idx,
      },
    });

    if (merchantProfileExist) {
      const checkDeviceID = await this.merchantDeviceRepo.findOne({
        where: {
          mobile_number: merchantProfileExist.mobile_number,
        },
      });
      if (checkDeviceID.deviceid !== device_id) {
        return 'Device ID Mismatch';
      } else {
        return idx;
      }
    }
  }

  // async setMPIN(pin) {
  //   const hashMobilePin = await hashString(pin.mpin);
  //   const data = {
  //     mpin: hashMobilePin,
  //   };
  //   await this.merchantWalletRepo.save(data);
  // }

  // async verifyMpin(pin, header) {
  //   const token = header.authorization.split(' ')[1];
  //   const { id } = await parseJwt(token);

  //   const merchantMpin = await this.merchantWalletRepo.findOne({
  //     where: {
  //       merchant_id: id,
  //     },
  //     select: ['mpin'],
  //   });

  //   if (merchantMpin) {
  //     const verifyMobilePin = await argon.verify(merchantMpin.mpin, pin.mpin);
  //   } else {
  //     throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
  //   }
  // }
}
