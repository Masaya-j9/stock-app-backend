import { Observable } from 'rxjs';
import { Category } from '../entities/category.entity';

export interface CategoryDomainInterface {
  updateCategoryFields(
    category: Category,
    name?: string,
    description?: string
  ): Observable<Category | null>;
}
