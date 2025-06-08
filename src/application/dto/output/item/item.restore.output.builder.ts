import { OutputBuilder } from '../output.builder';
import { ItemRestoreOutputDto } from './item.restore.output.dto';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';

export class ItemRestoreOutputBuilder
  implements OutputBuilder<ItemRestoreOutputDto>
{
  private readonly _item: Item;

  constructor(item: Item) {
    this._item = item;
  }
  build(): ItemRestoreOutputDto {
    const output = new ItemRestoreOutputDto();
    output.id = this._item.id;
    output.name = this._item.name;
    output.quantity = this._item.quantity;
    output.description = this._item.description;
    output.createdAt = this._item.createdAt;
    output.updatedAt = this._item.updatedAt;
    output.deletedAt = this._item.deletedAt;
    return output;
  }
}
