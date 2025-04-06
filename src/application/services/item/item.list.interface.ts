import { ItemListInputDto } from 'src/application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from 'src/application/dto/output/item/item.list.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface ItemListServiceInterface
  extends ApplicationService<ItemListInputDto, ItemListOutputDto> {
  ItemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
