import { Injectable } from '@nestjs/common';
import { RoleListServiceInterface } from './role.list.interface';
import { Observable } from 'rxjs';
import { RoleListInputDto } from 'src/application/dto/input/role/role.list.input.dto';
import { RoleListOutputDto } from 'src/application/dto/output/role/role.list.output.dto';

@Injectable()
export class RoleListService implements RoleListServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: RoleListInputDto): Observable<RoleListOutputDto> {
    return null; // 仮の実装
  }
}
