import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserBorrowings } from './intermediates/user.borrowings.entity';
import { BorrowingStocks } from './intermediates/borrowing.stocks.entity';
import { BorrowingReturns } from './intermediates/borrowing.returns.entity';

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

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

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
}
