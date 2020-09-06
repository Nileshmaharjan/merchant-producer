import { Module, HttpModule } from '@nestjs/common';
import { MerchantLoginController } from './merchant-login.controller';
import { MerchantLoginService } from './merchant-login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantDevice } from '@entities/MerchantDevice';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Transport } from '@nestjs/common/enums/transport.enum';
import config from '@config/index';
import { JwtStrategy } from './jwtStrategy';
import { MerchantSecurityQuestion } from '@entities/MerchantSecurityQuestion';
import { MerchantAnswers } from '@entities/MerchantAnswers';
import { MerchantProfile } from '@entities/MerchantProfile';
import { MerchantWallet } from '@entities/MerchantWallet';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: config.secret,
      signOptions: { expiresIn: config.expiresIn },
    }),
    ClientsModule.register([
      {
        name: 'kafka',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [config.kafkaBroker],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
    TypeOrmModule.forFeature([
      MerchantProfile,
      MerchantDevice,
      MerchantSecurityQuestion,
      MerchantAnswers,
      MerchantWallet,
    ]),
  ],
  controllers: [MerchantLoginController],
  providers: [MerchantLoginService, JwtStrategy],
  exports: [JwtStrategy],
})
export class MerchantLoginModule {}
