import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { BlogModule } from './blog.module';
import {
  AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
  RmqService,
  UnauthorizedExceptionFilter,
  ValidationExceptionsFilter,
} from '@app/common';
import ValidationExceptions from '@app/common/exceptions/validation.exceptions';

async function bootstrap() {
  const app = await NestFactory.create(BlogModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const globalPrefix = configService.get('GLOBAL_PREFFIX');
  app.setGlobalPrefix(globalPrefix);


  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationExceptions(errors),
    })
  );
  /*
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new UnauthorizedExceptionFilter(),
    new ForbiddenExceptionFilter(),
    new BadRequestExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValidationExceptionsFilter()
  );
*/
  await app.listen(configService.get('PORT'));
}
bootstrap();
