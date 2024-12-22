import { RoleListInputDto } from 'src/application/dto/input/role/role.list.input.dto';
import { RoleListOutputDto } from 'src/application/dto/output/role/role.list.output.dto';
import { ApplicationService } from '../application.service';

export interface RoleListServiceInterface
  extends ApplicationService<RoleListInputDto, RoleListOutputDto> {}
