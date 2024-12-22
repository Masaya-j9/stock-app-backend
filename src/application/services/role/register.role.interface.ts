import { RegisterRoleInputDto } from 'src/application/dto/input/role/register.role.input.dto';
import { RegisterRoleOutputDto } from 'src/application/dto/output/role/register.role.output.dto';
import { ApplicationService } from '../application.service';

export interface RegisterRoleServiceInterface
  extends ApplicationService<RegisterRoleInputDto, RegisterRoleOutputDto> {}
