import { Response as ExpressResponse } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import ValidationExceptions from '@app/common/exceptions/validation.exceptions';
import { ExceptionResponse } from '@app/common/interfaces/exception-response.interface';

@Catch(ValidationExceptions)
export class ValidationExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const res = ctx.getResponse<ExpressResponse>();

    const exceptionResponse: ExceptionResponse =
      exception.getResponse() as ExceptionResponse;

    return res.status(HttpStatus.BAD_REQUEST).json({
      error: exception.name,
      messages: exceptionResponse.messages,
    });
  }
}
