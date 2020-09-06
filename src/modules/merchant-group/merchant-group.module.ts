import { Module, HttpModule } from '@nestjs/common';
import { MerchantGroupController } from './merchant-group.controller';
import { MerchantGroupService } from './merchant-group.service';
import { MerchantGroup } from '@entities/MerchantGroup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/common/enums/transport.enum';
import config from '@config/index';
import { MerchantGroupTemp } from '@entities/MerchantGroupTemp';

@Module({
  imports: [
    HttpModule,
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
    TypeOrmModule.forFeature([MerchantGroup, MerchantGroupTemp]),
  ],
  controllers: [MerchantGroupController],
  providers: [MerchantGroupService],
})
export class MerchantGroupModule {}
