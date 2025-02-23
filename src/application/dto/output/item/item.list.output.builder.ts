import { OutputBuilder } from '../../output/output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';
import { ItemAndCategoryType } from '../../../../infrastructure/types/item.and.category.type';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class ItemListOutputBuilder implements OutputBuilder<ItemListOutputDto> {
  private _totalCount: number;
  private _items: Item[];
  private _categories: Category[];
  private _itemIdsAndCategoryIds: ItemAndCategoryType[];

  constructor(
    items?: Items[],
    totalCount?: number,
    categories?: Categories[],
    itemIdsAndCategoryIds?: ItemAndCategoryType[]
  ) {
    this._totalCount = totalCount ?? 0;
    this._itemIdsAndCategoryIds = itemIdsAndCategoryIds ?? [];
    this._items = items
      ? this.mapItems(items, this._itemIdsAndCategoryIds)
      : [];
    this._categories = categories ? this.mapCategories(categories) : [];
  }

  // CategoriesをCategoryドメインエンティティにマッピング
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

  // ItemsをItemドメインエンティティにマッピング
  private mapItems(
    items: Items[],
    itemIdsAndCategoryIds: ItemAndCategoryType[]
  ): Item[] {
    return items.map((item) => {
      const categoryIds = itemIdsAndCategoryIds
        .filter((itemCategory) => itemCategory.itemId === item.id)
        .map((itemCategory) => itemCategory.categoryId); // 修正：categoryIdを抽出

      return new Item(
        item.id,
        item.name,
        item.quantity,
        item.description,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
        categoryIds // 修正：取得したcategoryIdsをItemに渡す
      );
    });
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
              .filter(Boolean),
          }));
          return output;
        })();
  }
}
