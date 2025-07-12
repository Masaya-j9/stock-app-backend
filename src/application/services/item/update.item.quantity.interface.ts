import { UpdateItemQuantityInputDto } from '../../dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../dto/output/item/update.item.quantity.output.dto';
import { UpdateService } from '../update.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface UpdateItemQuantityServiceInterface
  extends UpdateService<
    UpdateItemQuantityInputDto,
    UpdateItemQuantityOutputDto
  > {
  itemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
