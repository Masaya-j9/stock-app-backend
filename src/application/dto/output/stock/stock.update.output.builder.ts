import { OutputBuilder } from '../../output/output.builder';
import { StockUpdateOutputDto } from './stock.update.output.dto';
import { Stock } from '../../../../domain/inventory/stocks/entities/stock.entity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';

export class StockUpdateOutputDtoBuilder
  implements OutputBuilder<StockUpdateOutputDto>
{
  private _stock: Stock;
  private _item: Items | undefined;

  constructor(stock: Stock, item?: Items | undefined) {
    this._stock = stock;
    this._item = item;
  }

  build(): StockUpdateOutputDto {
    const output = new StockUpdateOutputDto();

    output.id = this._stock.id;
    output.quantity = this._stock.quantity.value();
    output.description = this._stock.description;
    output.createdAt = this._stock.createdAt;
    output.updatedAt = this._stock.updatedAt;

    output.item = this._item
      ? {
          id: this._item.id,
          name: this._item.name,
        }
      : null;

    output.status = this._stock.status
      ? {
          id: this._stock.status.id,
          name: this._stock.status.name,
          description: this._stock.status.description,
        }
      : null;

    return output;
  }
}
