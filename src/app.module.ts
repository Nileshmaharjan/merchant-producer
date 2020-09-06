import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from '@config/typeorm.config';
import { MerchantModule } from '@modules/merchant/merchant.module';
import { MerchantGroupModule } from '@modules/merchant-group/merchant-group.module';
import { MerchantLoginModule } from '@modules/merchant-login/merchant-login.module';
import { AuthMiddleWare } from '@common/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    MerchantModule,
    MerchantGroupModule,
    MerchantLoginModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleWare)
      .forRoutes(
        { path: 'merchant', method: RequestMethod.ALL },
        { path: 'merchant-group', method: RequestMethod.ALL },
      );
  }
}
