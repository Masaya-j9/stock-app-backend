import { ItemListInputDto } from 'src/application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from 'src/application/dto/output/item/item.list.output.dto';
import { ApplicationService } from '../application.service';

export interface ItemListServiceInterface
  extends ApplicationService<ItemListInputDto, ItemListOutputDto> {}
