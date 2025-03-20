import { CategoryUpdateInputDto } from '../../dto/input/category/category.update.input.dto';
import { CategoryUpdateOutputDto } from '../../dto/output/category/category.update.output.dto';
import { UpdateService } from '../update.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryDomainService } from '../../../domain/inventory/items/services/category.domain.service';

export interface CategoryUpdateServiceInterface
  extends UpdateService<CategoryUpdateInputDto, CategoryUpdateOutputDto> {
  categoriesDatasource: CategoriesDatasource;
  categoryDomainService: CategoryDomainService;
}
