import { SignUpInputDto } from 'src/application/dto/input/user/signup.input.dto';
import { SignUpOutputDto } from 'src/application/dto/output/user/signup.output.dto';
import { ApplicationService } from '../application.service';

export interface SignUpServiceInterface
  extends ApplicationService<SignUpInputDto, SignUpOutputDto> {}
