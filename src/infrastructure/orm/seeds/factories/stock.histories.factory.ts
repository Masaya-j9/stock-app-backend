import { setSeederFactory } from 'typeorm-extension';
import { StockHistories } from '../../entities/stock.histories.entity';
import { faker } from '@faker-js/faker';

export const StockHistoriesFactory = setSeederFactory(StockHistories, () => {
  const stockHistories = new StockHistories();
  stockHistories.quantity = faker.number.int(1);
  stockHistories.createdAt = new Date();
  stockHistories.updatedAt = new Date();
  stockHistories.deletedAt = undefined;
  return stockHistories;
});
