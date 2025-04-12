import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { columnNameMap } from 'src/config/columnsMap.config';

@Injectable()
export class ValidationMessageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException && error.getStatus() === 400) {
          const response = error.getResponse() as Record<string, any>;
          if (typeof response.message === 'string') return response.message;

          const transformedMessage = response.message.map((message) => {
            const parts = message.split(' ');
            const propertyName = parts[0];
            const humanReadableName =
              columnNameMap[propertyName] || propertyName;
            return `${humanReadableName} ${parts.slice(1).join(' ')}`; // Reconstruct message
          });
          return throwError(
            () =>
              new HttpException(
                { ...response, message: transformedMessage },
                error.getStatus(),
              ),
          );
        } else {
          return throwError(() => error);
        }
      }),
    );
  }
}
