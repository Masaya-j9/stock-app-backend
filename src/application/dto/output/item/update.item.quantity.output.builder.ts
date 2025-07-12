import { OutputBuilder } from '../output.builder';
import { UpdateItemQuantityOutputDto } from './update.item.quantity.output.dto';

export class UpdateItemQuantityOutputBuilder
  implements OutputBuilder<UpdateItemQuantityOutputDto>
{
  private _id: number;
  private _quantity: number;
  private _updatedAt: Date;

  constructor(id: number, quantity: number, updatedAt: Date) {
    this._id = id;
    this._quantity = quantity;
    this._updatedAt = updatedAt;
  }

  build(): UpdateItemQuantityOutputDto {
    return (() => {
      const output = new UpdateItemQuantityOutputDto();
      output.id = this._id;
      output.quantity = this._quantity;
      output.updatedAt = this._updatedAt;
      return output;
    })();
  }
}
