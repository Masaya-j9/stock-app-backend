import { Category } from '../entities/category.entity';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';

export class CategoryDomainFactory {
  static fromInfrastructure(categories: Categories): Category {
    return new Category(
      categories.id,
      categories.name,
      categories.description,
      categories.createdAt,
      categories.updatedAt,
      categories.deletedAt
    );
  }

  static fromInfrastructureList(categories: Categories[]): Category[] {
    return categories.map((category) => this.fromInfrastructure(category));
  }
}
