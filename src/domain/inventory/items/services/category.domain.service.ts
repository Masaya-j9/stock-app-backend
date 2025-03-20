import { Injectable } from '@nestjs/common';
import { Category } from '../entities/category.entity';
import { CategoryDomainInterface } from '../repositories/category.domain.interface';
import { Observable, of } from 'rxjs';

@Injectable()
export class CategoryDomainService implements CategoryDomainInterface {
  updateCategoryFields(
    category: Category,
    name?: string,
    description?: string
  ): Observable<Category | null> {
    const updateFields = category.update(name, description);

    return of(updateFields);
  }
}
