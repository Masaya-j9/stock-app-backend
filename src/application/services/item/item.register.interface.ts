import { ItemRegisterInputDto } from 'src/application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from 'src/application/dto/output/item/item.register.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface ItemRegisterServiceInterface
  extends ApplicationService<ItemRegisterInputDto, ItemRegisterOutputDto> {
  itemsDatasource: ItemsDatasource;
  categoriesDatasource: CategoriesDatasource;
}
