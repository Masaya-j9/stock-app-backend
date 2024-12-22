import { Injectable } from '@nestjs/common';
import { ItemListServiceInterface } from './item.list.interface';
import { Observable } from 'rxjs';
import { ItemListInputDto } from 'src/application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from 'src/application/dto/output/item/item.list.output.dto';

@Injectable()
export class ItemListService implements ItemListServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: ItemListInputDto): Observable<ItemListOutputDto> {
    return null;
  }
}
