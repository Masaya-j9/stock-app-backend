import { OutputBuilder } from '../../output/output.builder';
import { StockRegisterOutputDto } from './stock.register.output.dto';
import { Stock } from '../../../../domain/inventory/stocks/entities/stock.entity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';

export class StockRegisterOutputDtoBuilder
  implements OutputBuilder<StockRegisterOutputDto>
{
  private _stock: Stock;
  private _item: Items | null;

  constructor(stock: Stock, item?: Items | null) {
    this._stock = stock;
    this._item = item || null;
  }

  build(): StockRegisterOutputDto {
    const output = new StockRegisterOutputDto();

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
