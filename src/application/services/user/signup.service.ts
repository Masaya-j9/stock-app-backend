import { Observable } from 'rxjs';
import { SignUpInputDto } from 'src/application/dto/input/user/signup.input.dto';
import { SignUpOutputDto } from 'src/application/dto/output/user/signup.output.dto';
import { SignUpServiceInterface } from './signup.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignUpService implements SignUpServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: SignUpInputDto): Observable<SignUpOutputDto> {
    // ここに実装を追加してください
    return null; // 仮の実装
  }
}
