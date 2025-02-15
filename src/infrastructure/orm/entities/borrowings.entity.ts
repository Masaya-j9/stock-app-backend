import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { UserBorrowings } from './intermediates/user.borrowings.entity';
import { BorrowingStocks } from './intermediates/borrowing.stocks.entity';
import { BorrowingReturns } from './intermediates/borrowing.returns.entity';
import { BorrowingComments } from './intermediates/borrowing.comments.entity';

/**
 * 貸出を管理するBorrowingsテーブルのエンティティ
 */
@Entity()
export class Borrowings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // 中間テーブルへのリレーション
  @OneToMany(() => UserBorrowings, (userBorrowings) => userBorrowings.borrowing)
  userBorrowings: UserBorrowings[];

  @OneToMany(
    () => BorrowingStocks,
    (borrowingStocks) => borrowingStocks.borrowing
  )
  borrowingStocks: BorrowingStocks[];

  @OneToMany(
    () => BorrowingReturns,
    (borrowingReturns) => borrowingReturns.borrowing
  )
  borrowingReturns: BorrowingReturns[];

  @OneToMany(
    () => BorrowingComments,
    (borrowingComments) => borrowingComments.borrowing
  )
  borrowingComments: BorrowingComments[];
}
