import { setSeederFactory } from 'typeorm-extension';
import { ReturnStocks } from '../../../entities/intermediates/return.stocks.entity';
import { Returns } from '../../../entities/returns.entity';
import { Stocks } from '../../../entities/stocks.entity';

export const returnStocksData = [
  { returnId: 1, stockId: 1 },
  { returnId: 2, stockId: 2 },
  { returnId: 3, stockId: 3 },
  { returnId: 4, stockId: 4 },
  { returnId: 5, stockId: 5 },
];

export const ReturnStocksFactory = returnStocksData.map((data) => {
  setSeederFactory(ReturnStocks, () => {
    const returnStocks = new ReturnStocks();
    returnStocks.returns = new Returns();
    returnStocks.stock = new Stocks();
    returnStocks.returns.id = data.returnId;
    returnStocks.stock.id = data.stockId;
    returnStocks.createdAt = new Date();
    returnStocks.updatedAt = new Date();
    returnStocks.deletedAt = undefined;

    return returnStocks;
  });
});
