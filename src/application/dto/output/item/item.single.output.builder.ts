import { OutputBuilder } from '../output.builder';
import { ItemSingleOutputDto } from './item.single.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from 'src/domain/inventory/items/entities/category.entity';

export class ItemSingleOutputBuilder
  implements OutputBuilder<ItemSingleOutputDto>
{
  private _item: Item;
  private _categories: Category[];

  constructor(item: Item, categories: Category[]) {
    this._item = item;
    this._categories = categories;
  }

  build(): ItemSingleOutputDto {
    const output = new ItemSingleOutputDto();
    output.id = this._item.id;
    output.name = this._item.name;
    output.quantity = this._item.quantity;
    output.description = this._item.description;
    output.createdAt = this._item.createdAt;
    output.updatedAt = this._item.updatedAt;
    output.itemCategories = this._categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
    return output;
  }
}
