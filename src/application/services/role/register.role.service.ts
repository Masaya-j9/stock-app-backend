import { Injectable } from '@nestjs/common';
import { RegisterRoleServiceInterface } from './register.role.interface';
import { Observable } from 'rxjs';
import { RegisterRoleInputDto } from 'src/application/dto/input/role/register.role.input.dto';
import { RegisterRoleOutputDto } from 'src/application/dto/output/role/register.role.output.dto';

@Injectable()
export class RegisterRoleService implements RegisterRoleServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: RegisterRoleInputDto): Observable<RegisterRoleOutputDto> {
    return null; //仮の実装
  }
}
