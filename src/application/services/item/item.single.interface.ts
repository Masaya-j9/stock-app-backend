import { ItemSingleInputDto } from '../../dto/input/item/item.single.input.dto';
import { ItemSingleOutputDto } from '../../dto/output/item/item.single.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface ItemSingleServiceInterface
  extends ApplicationService<ItemSingleInputDto, ItemSingleOutputDto> {
  itemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
