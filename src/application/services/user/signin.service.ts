import { Injectable } from '@nestjs/common';
import { SignInServiceInterface } from './signin.interface';
import { Observable } from 'rxjs';
import { SignInInputDto } from 'src/application/dto/input/user/signin.input.dto';
import { SignInOutputDto } from 'src/application/dto/output/user/signin.output.dto';

@Injectable()
export class SignInService implements SignInServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: SignInInputDto): Observable<SignInOutputDto> {
    // ここで実際のサインインロジックを実装します。
    // 例えば、ユーザー認証を行い、認証成功時にはSignInOutputDtoを返し、失敗時にはエラーを投げるなど。
    // この例では、シンプルにSignInOutputDtoを返すようにしています。
    return null; // 実際のロジックに置き換えてください。
  }
}
