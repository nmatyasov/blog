import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('PROFILE'));
  await app.startAllMicroservices();
}
bootstrap();
