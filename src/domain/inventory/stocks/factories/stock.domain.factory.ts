import { Stock } from '../entities/stock.entity';
import { StockStatus } from '../entities/stock.status.entity';
import { Stocks } from '../../../../infrastructure/orm/entities/stocks.entity';
import { Quantity } from '../../items/value-objects/quantity';

export class StockDomainFactory {
  static fromInfrastructure(stock: Stocks): Stock {
    return new Stock(
      stock.id,
      Quantity.of(stock.quantity),
      stock.description,
      stock.createdAt,
      stock.updatedAt,
      stock.deletedAt,
      stock.item ? stock.item.id : null,
      stock.status
        ? new StockStatus(
            stock.status.id,
            stock.status.name,
            stock.status.description,
            stock.status.createdAt,
            stock.status.updatedAt,
            stock.status.deletedAt
          )
        : null
    );
  }

  static fromInfrastructureList(stocks: Stocks[]): Stock[] {
    return stocks.map((stock) => this.fromInfrastructure(stock));
  }
}
