import { OutputBuilder } from '../output.builder';
import {
  ItemRegisterOutputDto,
  itemCategories,
} from './item.register.output.dto';

export class ItemRegisterOutputBuilder
  implements OutputBuilder<ItemRegisterOutputDto>
{
  private _id: number;
  private _name: string;
  private _quantity: number;
  private _description: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _itemCategories: itemCategories[];

  constructor(
    id: number,
    name: string,
    quantity: number,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    itemCategories: itemCategories[]
  ) {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._itemCategories = itemCategories;
  }

  build(): ItemRegisterOutputDto {
    return (() => {
      const output = new ItemRegisterOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.quantity = this._quantity;
      output.description = this._description;
      output.createdAt = this._createdAt;
      output.updatedAt = this._updatedAt;
      output.itemsCategories = this._itemCategories.map((itemCategory) => {
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
