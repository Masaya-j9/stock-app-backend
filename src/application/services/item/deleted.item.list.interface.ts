import { DeletedItemListInputDto } from '../../dto/input/item/deleted.item.list.input.dto';
import { DeletedItemListOutputDto } from '../../dto/output/item/deleted.item.list.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface DeletedItemListServiceInterface
  extends ApplicationService<
    DeletedItemListInputDto,
    DeletedItemListOutputDto
  > {
  ItemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
