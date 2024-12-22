import { SignInInputDto } from 'src/application/dto/input/user/signin.input.dto';
import { SignInOutputDto } from 'src/application/dto/output/user/signin.output.dto';
import { ApplicationService } from '../application.service';

export interface SignInServiceInterface
  extends ApplicationService<SignInInputDto, SignInOutputDto> {}
