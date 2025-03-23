import { OutputBuilder } from '../../output/output.builder';
import { ItemListOutputDto, itemCategories } from './item.list.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class ItemListOutputBuilder implements OutputBuilder<ItemListOutputDto> {
  private _totalCount: number;
  private _items: Item[];
  private _categories: Category[];

  constructor(items: Item[], totalCount: number, categories: Category[]) {
    this._totalCount = totalCount;
    this._items = items;
    this._categories = categories;
  }

  build(): ItemListOutputDto {
    return this._totalCount === 0
      ? (() => {
          throw new NotFoundException('Items not found');
        })()
      : (() => {
          const output = new ItemListOutputDto();
          output.count = this._totalCount;
          output.results = this._items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            description: item.description,
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
