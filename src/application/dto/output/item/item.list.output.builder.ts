import { OutputBuilder } from '../../output/output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';

export class ItemListOutputBuilder implements OutputBuilder<ItemListOutputDto> {
  private _totalCount: number;
  private _items: Item[];
  private _categories: Category[];

  constructor(items?: Item[], totalCount?: number, categories?: Category[]) {
    this._totalCount = totalCount;
    this._items = items;
    this._categories = categories;
  }

  set totalCount(total_count: number) {
    this._totalCount = total_count;
  }

  set items(items: Item[]) {
    this._items = items;
  }

  set categories(categories: Category[]) {
    this._categories = categories;
  }

  build(): ItemListOutputDto {
    const output = new ItemListOutputDto();
    output.count = this._totalCount;
    console.log('categories:', this._categories);
    output.results = this._items.map((item) => {
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        description: item.description,
        itemsCategories: this._categories
          .filter((category) => category.itemId == item.id)
          .map(({ id, name, itemId, createdAt, updatedAt }) => ({
            id,
            name,
            itemId,
            createdAt,
            updatedAt,
          })),
      };
    });
    console.log('output:', output);
    return output;
  }
}
