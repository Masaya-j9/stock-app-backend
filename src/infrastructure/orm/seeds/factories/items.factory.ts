import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { Items } from '../../entities/items.entity';

// 10件のアイテムデータを生成
export const ItemsFactory = setSeederFactory(Items, () => {
  const item = new Items();
  item.name = faker.commerce.productName();
  item.quantity = faker.number.int({ min: 20, max: 100 });
  item.description = faker.commerce.productDescription();
  item.createdAt = new Date();
  item.updatedAt = new Date();
  item.deletedAt = undefined;

  return item;
});
