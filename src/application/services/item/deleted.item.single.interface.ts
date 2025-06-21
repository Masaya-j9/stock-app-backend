import { DeletedItemSingleInputDto } from '../../dto/input/item/deleted.item.single.input.dto';
import { DeletedItemSingleOutputDto } from '../../dto/output/item/deleted.item.single.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface DeletedItemSingleServiceInterface
  extends ApplicationService<
    DeletedItemSingleInputDto,
    DeletedItemSingleOutputDto
  > {
  itemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
