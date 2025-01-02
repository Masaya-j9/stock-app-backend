import { setSeederFactory } from 'typeorm-extension';
import { Returns } from '../../entities/returns.entity';

const returnsData = [
  { quantity: 1 },
  { quantity: 1 },
  { quantity: 1 },
  { quantity: 1 },
  { quantity: 1 },
];

export const ReturnsFactory = setSeederFactory(Returns, () => {
  const newReturns = new Returns();
  const returns = returnsData.shift(); // 順番にデータを取得
  if (returns) {
    newReturns.quantity = returns.quantity;
    newReturns.createdAt = new Date();
    newReturns.updatedAt = new Date();
    newReturns.deletedAt = undefined;
  }
  return newReturns;
});
