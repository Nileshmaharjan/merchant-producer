import config from '@config/index';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors();
  // app.use(helmet());
  // app.use(compression());

  const options = new DocumentBuilder()
    .setTitle('Lms Api')
    .setBasePath('v1')
    .setDescription(
      'The LMS API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // app.connectMicroservice({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: [config.kafkaBroker],
  //     },
  //     consumer: {
  //       groupId: 'proj-1',
  //       allowAutoTopicCreation: true,
  //     },
  //   },
  // });

  await app.startAllMicroservicesAsync();
  await app.listen(config.port);
}

bootstrap();
