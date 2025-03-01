import { CategoryRegisterInputDto } from '../../../application/dto/input/category/category.register.input.dto';
import { CategoryRegisterOutputDto } from '../../../application/dto/output/category/category.register.output.dto';
import { ApplicationService } from '../application.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';

export interface CategoryRegisterServiceInterface
  extends ApplicationService<
    CategoryRegisterInputDto,
    CategoryRegisterOutputDto
  > {
  categoriesDatasource: CategoriesDatasource;
}
