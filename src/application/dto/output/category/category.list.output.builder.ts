import { OutputBuilder } from '../../output/output.builder';
import { CategoryListOutputDto } from './category.list.output.dto';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class CategoryListOutputBuilder
  implements OutputBuilder<CategoryListOutputDto>
{
  private _totalCount: number;
  private _categories: Category[];

  constructor(categories?: Categories[], totalCount?: number) {
    this._totalCount = totalCount ?? 0;
    this._categories = categories ? this.mapCategories(categories) : [];
  }

  private mapCategories(categories: Categories[]): Category[] {
    return categories.map((category) => {
      return new Category(
        category.id,
        category.name,
        category.description,
        category.createdAt,
        category.updatedAt,
        category.deletedAt
      );
    });
  }

  build(): CategoryListOutputDto {
    return this._totalCount === 0
      ? (() => {
          throw new NotFoundException('Categories not found');
        })()
      : (() => {
          const output = new CategoryListOutputDto();
          output.count = this._totalCount;
          output.categories = this._categories.map((category) => ({
            id: category.id, // プロパティ名を変換
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          }));
          return output;
        })();
  }
}
