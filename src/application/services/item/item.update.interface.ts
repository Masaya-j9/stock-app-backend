import { ItemUpdateInputDto } from '../../dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../dto/output/item/item.update.output.dto';
import { UpdateService } from '../update.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';

export interface ItemUpdateServiceInterface
  extends UpdateService<ItemUpdateInputDto, ItemUpdateOutputDto> {
  itemsDatasource: ItemsDatasource;
}
