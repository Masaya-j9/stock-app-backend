import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggerInterceptor.name');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    this.logger.log(`Request: [${method}] ${url}`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - start;
          this.logger.log(
            `Response: [${method}] ${url} ${responseTime}ms - ${JSON.stringify(response)}`
          );
        },
        error: (err) => {
          const responseTime = Date.now() - start;
          this.logger.error(
            `Error: [${method}] ${url} ${responseTime}ms - ${err.message}`
          );
        },
      })
    );
  }
}
