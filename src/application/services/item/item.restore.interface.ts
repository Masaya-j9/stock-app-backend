import { ItemRestoreInputDto } from '../../dto/input/item/item.restore.input.dto';
import { ItemRestoreOutputDto } from '../../dto/output/item/item.restore.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';

export interface ItemRestoreServiceInterface
  extends ApplicationService<ItemRestoreInputDto, ItemRestoreOutputDto> {
  itemsDatasource: ItemsDatasource;
}
