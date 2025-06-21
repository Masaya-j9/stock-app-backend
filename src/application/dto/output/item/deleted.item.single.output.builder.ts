import { OutputBuilder } from '../output.builder';
import { DeletedItemSingleOutputDto } from './deleted.item.single.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from 'src/domain/inventory/items/entities/category.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

export class DeletedItemSingleOutputBuilder
  implements OutputBuilder<DeletedItemSingleOutputDto>
{
  private _item: Item;
  private _categories: Category[];

  constructor(item: Item, categories: Category[]) {
    this._item = item;
    this._categories = categories;
  }

  build(): DeletedItemSingleOutputDto {
    if (!this._item) {
      throw new HttpException('Items not found', HttpStatus.NOT_FOUND);
    }
    const output = new DeletedItemSingleOutputDto();
    output.id = this._item.id;
    output.name = this._item.name;
    output.quantity = this._item.quantity;
    output.description = this._item.description;
    output.createdAt = this._item.createdAt;
    output.updatedAt = this._item.updatedAt;
    output.deletedAt = this._item.deletedAt;
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
