import { EditProfileInputDto } from 'src/application/dto/input/profile/edit.profile.input.dto';
import { EditProfileOutputDto } from 'src/application/dto/output/profile/edit.profile.output.dto';
import { ApplicationService } from '../application.service';

export interface EditProfileServiceInterface
  extends ApplicationService<EditProfileInputDto, EditProfileOutputDto> {}
