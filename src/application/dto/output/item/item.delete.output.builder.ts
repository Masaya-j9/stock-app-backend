import { OutputBuilder } from '../output.builder';
import { ItemDeleteOutputDto } from './item.delete.output.dto';

export class ItemDeleteOutputBuilder
  implements OutputBuilder<ItemDeleteOutputDto>
{
  private _id: number;
  private _name: string;
  private _quantity: number;
  private _description: string;
  private _updatedAt: Date;
  private _deletedAt: Date;

  constructor(
    id: number,
    name: string,
    quantity: number,
    description: string,
    updatedAt: Date,
    deletedAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._description = description;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  build(): ItemDeleteOutputDto {
    return (() => {
      const output = new ItemDeleteOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.quantity = this._quantity;
      output.description = this._description;
      output.updatedAt = this._updatedAt;
      output.deletedAt = this._deletedAt;
      return output;
    })();
  }
}
