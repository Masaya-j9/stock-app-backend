import { ItemDeleteInputDto } from '../../dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../dto/output/item/item.delete.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';

export interface ItemDeleteServiceInterface
  extends ApplicationService<ItemDeleteInputDto, ItemDeleteOutputDto> {
  itemsDatasource: ItemsDatasource;
}
