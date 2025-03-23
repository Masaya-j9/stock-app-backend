import { OutputBuilder } from '../../output/output.builder';
import { CategoryListOutputDto } from './category.list.output.dto';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class CategoryListOutputBuilder
  implements OutputBuilder<CategoryListOutputDto>
{
  private _totalCount: number;
  private _categories: Category[];

  constructor(categories: Category[], totalCount: number) {
    this._totalCount = totalCount;
    this._categories = categories;
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
