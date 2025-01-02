import { setSeederFactory } from 'typeorm-extension';
import { Borrowings } from '../../entities/borrowings.entity';

export const BorrowingsFactory = setSeederFactory(Borrowings, () => {
  const borrowing = new Borrowings();
  borrowing.quantity = 1;
  borrowing.description = 'This is a test borrowing';
  borrowing.createdAt = new Date();
  borrowing.updatedAt = new Date();
  borrowing.deletedAt = undefined;

  return borrowing;
});
