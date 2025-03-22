import { CategoryDeleteInputDto } from '../../../application/dto/input/category/category.delete.input.dto';
import { CategoryDeleteOutputDto } from '../../../application/dto/output/category/category.delete.output.dto';
import { ApplicationService } from '../application.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface CategoryDeleteServiceInterface
  extends ApplicationService<CategoryDeleteInputDto, CategoryDeleteOutputDto> {
  categoriesDatasource: CategoriesDatasource;
}
