import { setSeederFactory } from 'typeorm-extension';
import { BorrowingReturns } from '../../../entities/intermediates/borrowing.returns.entity';
import { Borrowings } from '../../../entities/borrowings.entity';
import { Returns } from '../../../entities/returns.entity';
import { Statuses } from '../../../entities/statuses.entity';

// 前半5件は貸出中、後半5件は返却済み
const borrowingReturnsData = [
  { borrowingId: 1, returnId: 1, statusId: 2 },
  { borrowingId: 2, returnId: 2, statusId: 2 },
  { borrowingId: 3, returnId: 3, statusId: 2 },
  { borrowingId: 4, returnId: 4, statusId: 2 },
  { borrowingId: 5, returnId: 5, statusId: 4 },
  { borrowingId: 6, returnId: 6, statusId: 4 },
  { borrowingId: 7, returnId: 7, statusId: 4 },
  { borrowingId: 8, returnId: 8, statusId: 4 },
  { borrowingId: 9, returnId: 9, statusId: 4 },
  { borrowingId: 10, returnId: 10, statusId: 4 },
];

export const BorrowingReturnsFactory = setSeederFactory(
  BorrowingReturns,
  () => {
    const newBorrowingReturns = new BorrowingReturns();
    const borrowingReturns = borrowingReturnsData.shift(); // 順番にデータを取得
    if (borrowingReturns) {
      newBorrowingReturns.borrowing = new Borrowings();
      newBorrowingReturns.borrowing.id = borrowingReturns.borrowingId;

      newBorrowingReturns.returns = new Returns();
      newBorrowingReturns.returns.id = borrowingReturns.returnId;

      newBorrowingReturns.statuses = new Statuses();
      newBorrowingReturns.statuses.id = borrowingReturns.statusId;

      newBorrowingReturns.createdAt = new Date();
      newBorrowingReturns.updatedAt = new Date();
    }
    return newBorrowingReturns;
  }
);
