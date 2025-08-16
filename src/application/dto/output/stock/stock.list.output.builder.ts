import { OutputBuilder } from '../../output/output.builder';
import { StockListOutputDto } from './stock.list.output.dto';
import { Stock } from '../../../../domain/inventory/stocks/entities/stock.entity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { NotFoundException } from '@nestjs/common';

export class StockListOutputBuilder
  implements OutputBuilder<StockListOutputDto>
{
  private _totalCount: number;
  private _stocks: Stock[];
  private _items: Items[];
  private _totalPages: number;

  constructor(
    stocks: Stock[],
    items: Items[],
    totalCount: number,
    totalPage: number
  ) {
    this._totalCount = totalCount;
    this._stocks = stocks;
    this._items = items;
    this._totalPages = totalPage;
  }

  build(): StockListOutputDto {
    return this._totalCount === 0
      ? (() => {
          throw new NotFoundException('Stocks not found');
        })()
      : (() => {
          const output = new StockListOutputDto();
          output.count = this._totalCount;
          output.totalPages = this._totalPages;
          output.results = this._stocks.map((stock) => {
            const item = stock.itemId
              ? this._items.find((item) => item.id === stock.itemId)
              : null;

            return {
              id: stock.id,
              quantity: stock.quantity.value(),
              description: stock.description,
              createdAt: stock.createdAt,
              updatedAt: stock.updatedAt,
              item: item
                ? {
                    id: item.id,
                    name: item.name,
                  }
                : null,
              status: stock.status
                ? {
                    id: stock.status.id,
                    name: stock.status.name,
                    description: stock.status.description,
                  }
                : null,
            };
          });
          return output;
        })();
  }
}
