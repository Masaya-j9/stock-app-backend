import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../dto/output/category/category.list.output.dto';
import { ApplicationService } from '../application.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface CategoryListServiceInterface
  extends ApplicationService<CategoryListInputDto, CategoryListOutputDto> {
  categoriesDatasource: CategoriesDatasource;
}
