import { ProfileInputDto } from 'src/application/dto/input/profile/profile.input.dto';
import { ApplicationService } from '../application.service';
import { ProfileOutputDto } from 'src/application/dto/output/profile/profile.output.dto';

export interface ProfileServiceInterface
  extends ApplicationService<ProfileInputDto, ProfileOutputDto> {}
