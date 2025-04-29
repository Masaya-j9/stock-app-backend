import { OutputBuilder } from '../output.builder';
import { ItemUpdateOutputDto, itemCategories } from './item.update.output.dto';

export class ItemUpdateOutputBuilder
  implements OutputBuilder<ItemUpdateOutputDto>
{
  private _id: number;
  private _name: string;
  private _quantity: number;
  private _description: string;
  private _updatedAt: Date;
  private _itemCategories: itemCategories[];

  constructor(
    id: number,
    name: string,
    quantity: number,
    description: string,
    updatedAt: Date,
    itemCategories: itemCategories[]
  ) {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._description = description;
    this._updatedAt = updatedAt;
    this._itemCategories = itemCategories;
  }

  build(): ItemUpdateOutputDto {
    return (() => {
      const output = new ItemUpdateOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.quantity = this._quantity;
      output.description = this._description;
      output.updatedAt = this._updatedAt;
      output.itemCategories = this._itemCategories.map((itemCategory) => {
        return {
          id: itemCategory.id,
          name: itemCategory.name,
          description: itemCategory.description,
        };
      });
      return output;
    })();
  }
}
