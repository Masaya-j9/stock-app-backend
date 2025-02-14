import { ItemListInputDto } from 'src/application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from 'src/application/dto/output/item/item.list.output.dto';
import { ApplicationService } from '../application.service';
import { ItemListDatasource } from '../../../infrastructure/datasources/items/item.list.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface ItemListServiceInterface
  extends ApplicationService<ItemListInputDto, ItemListOutputDto> {
  itemListDatasource: ItemListDatasource;
  categoriesDatasource: CategoriesDatasource;
}
