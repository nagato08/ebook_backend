import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const { message: msg } = exceptionResponse as any;
        message = msg || exception.message;
      } else {
        message = exceptionResponse.toString();
      }

      // Map codes d'erreur
      if (status === HttpStatus.BAD_REQUEST) {
        code = 'BAD_REQUEST';
      } else if (status === HttpStatus.UNAUTHORIZED) {
        code = 'UNAUTHORIZED';
      } else if (status === HttpStatus.FORBIDDEN) {
        code = 'FORBIDDEN';
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 'NOT_FOUND';
      } else if (status === HttpStatus.CONFLICT) {
        code = 'CONFLICT';
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Une erreur est survenue. Veuillez réessayer plus tard.';
      code = 'ERROR';
    }

    response.status(status).json({
      error: message,
      code,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
