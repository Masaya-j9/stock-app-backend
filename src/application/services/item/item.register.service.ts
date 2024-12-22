import { Injectable } from '@nestjs/common';
import { ItemRegisterServiceInterface } from './item.register.interface';
import { Observable } from 'rxjs';
import { ItemRegisterInputDto } from 'src/application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from 'src/application/dto/output/item/item.register.output.dto';

@Injectable()
export class ItemRegisterService implements ItemRegisterServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: ItemRegisterInputDto): Observable<ItemRegisterOutputDto> {
    return null;
  }
}
