import { NestFactory } from '@nestjs/core';
import { FeedModule } from './feed.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import {
  BadRequestExceptionFilter,
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter,
  ValidationExceptionsFilter,
  NotFoundExceptionFilter,
  AllExceptionsFilter,
} from '@app/common';
import ValidationExceptions from '@app/common/exceptions/validation.exceptions';

async function bootstrap() {
  const app = await NestFactory.create(FeedModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('FEED'));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationExceptions(errors),
    })
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new UnauthorizedExceptionFilter(),
    new ForbiddenExceptionFilter(),
    new BadRequestExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValidationExceptionsFilter()
  );

  await app.startAllMicroservices();
}
bootstrap();
