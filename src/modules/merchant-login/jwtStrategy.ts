import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import config from '@config/index';
import { Repository } from 'typeorm';
import { MerchantDevice } from '@entities/MerchantDevice';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(MerchantDevice)
    private readonly merchantDeviceRepo: Repository<MerchantDevice>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret,
    });
  }

  async validate(payload: any) {
    const { mobile_number } = payload;
    return this.merchantDeviceRepo.findOne({ where: { mobile_number } });
  }
}
