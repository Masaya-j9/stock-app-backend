import { setSeederFactory } from 'typeorm-extension';
import { Stocks } from '../../entities/stocks.entity';
import { Items } from '../../entities/items.entity';
import { faker } from '@faker-js/faker';

export const stockData = [
  { quantity: 5, item_id: 1, status_id: 1 },
  { quantity: 5, item_id: 2, status_id: 1 },
  { quantity: 5, item_id: 3, status_id: 1 },
  { quantity: 5, item_id: 4, status_id: 1 },
  { quantity: 5, item_id: 5, status_id: 1 },
  { quantity: 5, item_id: 6, status_id: 1 },
  { quantity: 5, item_id: 7, status_id: 1 },
  { quantity: 5, item_id: 8, status_id: 1 },
  { quantity: 5, item_id: 9, status_id: 1 },
  { quantity: 5, item_id: 10, status_id: 1 },
];

//10件の在庫データを生成
export const StocksFactory = setSeederFactory(Stocks, () => {
  const newStock = new Stocks();
  const stock = stockData.shift();
  if (stock) {
    newStock.quantity = stock.quantity;
    newStock.item = new Items();
    newStock.description = faker.commerce.productDescription();
    newStock.item.id = stock.item_id;
    newStock.createdAt = new Date();
    newStock.updatedAt = new Date();
    newStock.deletedAt = undefined;
  }
  return newStock;
});
