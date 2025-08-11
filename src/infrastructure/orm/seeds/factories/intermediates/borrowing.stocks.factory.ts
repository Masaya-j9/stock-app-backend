import { setSeederFactory } from 'typeorm-extension';
import { BorrowingStocks } from '../../../entities/intermediates/borrowing.stocks.entity';
import { Borrowings } from '../../../entities/borrowings.entity';
import { Stocks } from '../../../entities/stocks.entity';

export const borrowingStocksData = [
  { borrowingId: 1, stockId: 1 },
  { borrowingId: 2, stockId: 2 },
  { borrowingId: 3, stockId: 3 },
  { borrowingId: 4, stockId: 4 },
  { borrowingId: 5, stockId: 5 },
];

export const BorrowingStocksFactory = borrowingStocksData.map((data) => {
  setSeederFactory(BorrowingStocks, () => {
    const borrowingStocks = new BorrowingStocks();
    borrowingStocks.borrowing = new Borrowings();
    borrowingStocks.stock = new Stocks();
    borrowingStocks.borrowing.id = data.borrowingId;
    borrowingStocks.stock.id = data.stockId;
    borrowingStocks.createdAt = new Date();
    borrowingStocks.updatedAt = new Date();
    borrowingStocks.deletedAt = undefined;

    return borrowingStocks;
  });
});
