import { setSeederFactory } from 'typeorm-extension';
import { UserBorrowings } from '../../../entities/intermediates/user.borrowings.entity';
import { Users } from '../../../entities/users.entity';
import { Borrowings } from '../../../entities/borrowings.entity';

const userBorrwingsData = [
  { userId: 1, borrowingId: 1 },
  { userId: 2, borrowingId: 2 },
  { userId: 3, borrowingId: 3 },
  { userId: 4, borrowingId: 4 },
  { userId: 5, borrowingId: 5 },
  { userId: 6, borrowingId: 6 },
  { userId: 7, borrowingId: 7 },
  { userId: 8, borrowingId: 8 },
  { userId: 9, borrowingId: 9 },
  { userId: 10, borrowingId: 10 },
];

export const UserBorrowingsFactory = userBorrwingsData.map((data) => {
  setSeederFactory(UserBorrowings, () => {
    const userBorrowings = new UserBorrowings();
    userBorrowings.user = new Users();
    userBorrowings.borrowing = new Borrowings();
    userBorrowings.user.id = data.userId;
    userBorrowings.borrowing.id = data.borrowingId;
    userBorrowings.createdAt = new Date();
    userBorrowings.updatedAt = new Date();
    userBorrowings.deletedAt = undefined;

    return userBorrowings;
  });
});
