import { Injectable } from '@nestjs/common';
import { ProfileServiceInterface } from './profile.interface';
import { Observable } from 'rxjs';
import { ProfileInputDto } from 'src/application/dto/input/profile/profile.input.dto';
import { ProfileOutputDto } from 'src/application/dto/output/profile/profile.output.dto';

@Injectable()
export class ProfileService implements ProfileServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: ProfileInputDto): Observable<ProfileOutputDto> {
    // ここでは実際のユーザーのプロフィール情報を返すロジックを実装します
    return null;
  }
}
