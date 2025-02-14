import { OutputBuilder } from '../../output/output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';
import { ItemCategories } from '../../../../infrastructure/orm/entities/intermediates/item.categories.entity';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class ItemListOutputBuilder implements OutputBuilder<ItemListOutputDto> {
  private _totalCount: number;
  private _items: Item[];
  private _categories: Category[];

  constructor(items?: Items[], totalCount?: number, categories?: Category[]) {
    this._totalCount = totalCount ?? 0;
    this._items = items ? this.mapItems(items) : [];
    this._categories = categories ?? [];
  }

  set totalCount(total_count: number) {
    this._totalCount = total_count;
  }

  set items(items: Items[]) {
    this._items = this.mapItems(items);
  }

  set categories(categories: Categories[]) {
    this._categories = this.mapCategories(categories);
  }

  private mapCategories(categories: Categories[]): Category[] {
    return categories.map(
      (category) =>
        new Category(
          category.id,
          category.name,
          category.description,
          category.itemId,
          category.createdAt,
          category.updatedAt,
          category.deletedAt
        )
    );
  }

  private mapItemCategories(itemCategories: ItemCategories[]): Category[] {
    return itemCategories
      ? itemCategories.map(
          (itemCategory) =>
            new Category(
              itemCategory.category.id,
              itemCategory.category.name,
              itemCategory.category.description,
              itemCategory.category.itemId,
              itemCategory.category.createdAt,
              itemCategory.category.updatedAt,
              itemCategory.category.deletedAt
            )
        )
      : [];
  }

  private mapItems(items: Items[]): Item[] {
    return items.map(
      (item) =>
        new Item(
          item.id,
          item.name,
          item.quantity,
          item.description,
          item.createdAt,
          item.updatedAt,
          item.deletedAt,
          this.mapItemCategories(item.itemCategories || [])
        )
    );
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
            itemsCategories: this._categories
              .filter((category) => category.itemId == item.id)
              .map(
                ({ id, name, itemId, description, createdAt, updatedAt }) => ({
                  id,
                  name,
                  itemId,
                  description,
                  createdAt,
                  updatedAt,
                })
              ),
          }));
          return output;
        })();
  }
}
