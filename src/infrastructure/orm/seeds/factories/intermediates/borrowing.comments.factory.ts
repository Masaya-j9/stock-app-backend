import { setSeederFactory } from 'typeorm-extension';
import { BorrowingComments } from '../../../entities/intermediates/borrowing.comments.entity';
import { Borrowings } from '../../../entities/borrowings.entity';
import { Comments } from '../../../entities/comments.entity';

export const borrowingCommensData = [
  { borrowingId: 1, commentId: 1 },
  { borrowingId: 2, commentId: 2 },
  { borrowingId: 3, commentId: 3 },
  { borrowingId: 4, commentId: 4 },
  { borrowingId: 5, commentId: 5 },
  { borrowingId: 6, commentId: 6 },
  { borrowingId: 7, commentId: 7 },
  { borrowingId: 8, commentId: 8 },
  { borrowingId: 9, commentId: 9 },
  { borrowingId: 10, commentId: 10 },
];

export const BorrowingCommentsFactory = setSeederFactory(
  BorrowingComments,
  () => {
    const newBorrowingComments = new BorrowingComments();
    const borrowingComments = borrowingCommensData.shift();
    if (borrowingComments) {
      newBorrowingComments.borrowing = new Borrowings();
      newBorrowingComments.comment = new Comments();
      newBorrowingComments.borrowing.id = borrowingComments.borrowingId;
      newBorrowingComments.comment.id = borrowingComments.commentId;
      newBorrowingComments.createdAt = new Date();
      newBorrowingComments.updatedAt = new Date();
      newBorrowingComments.deletedAt = undefined;

      return newBorrowingComments;
    }
  }
);
