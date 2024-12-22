import { Injectable } from '@nestjs/common';
import { EditProfileServiceInterface } from './edit.profile.interface';
import { Observable } from 'rxjs';
import { EditProfileInputDto } from 'src/application/dto/input/profile/edit.profile.input.dto';
import { EditProfileOutputDto } from 'src/application/dto/output/profile/edit.profile.output.dto';

@Injectable()
export class EditProfileService implements EditProfileServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: EditProfileInputDto): Observable<EditProfileOutputDto> {
    return null;
  }
}
