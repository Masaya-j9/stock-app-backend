import { OutputBuilder } from '../../output/output.builder';
import {
  DeletedItemListOutputDto,
  itemCategories,
} from './deleted.item.list.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class DeletedItemListOutputBuilder
  implements OutputBuilder<DeletedItemListOutputDto>
{
  private _totalCount: number;
  private _items: Item[];
  private _totalPages: number;
  private _categories: Category[];

  constructor(
    items: Item[],
    totalCount: number,
    totalPage: number,
    categories: Category[]
  ) {
    this._totalCount = totalCount;
    this._items = items;
    this._totalPages = totalPage;
    this._categories = categories;
  }

  build(): DeletedItemListOutputDto {
    return this._totalCount === 0
      ? (() => {
          throw new NotFoundException('Items not found');
        })()
      : (() => {
          const output = new DeletedItemListOutputDto();
          output.count = this._totalCount;
          output.totalPages = this._totalPages;
          output.results = this._items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            description: item.description,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            deletedAt: item.deletedAt,
            itemsCategories: item.categoryIds
              .map((categoryId) => {
                const category = this._categories.find(
                  (cat) => cat.id === categoryId
                );
                return category
                  ? {
                      id: category.id,
                      name: category.name,
                      description: category.description,
                      createdAt: category.createdAt,
                      updatedAt: category.updatedAt,
                    }
                  : null;
              })
              .filter(Boolean) as itemCategories[],
          }));
          return output;
        })();
  }
}
