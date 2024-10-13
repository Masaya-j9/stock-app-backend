import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
@Injectable()
export class AppService {
  getObservableHelloWorld(): Observable<string> {
    return of('Hello World!');
  }
}
