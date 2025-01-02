import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Borrowings } from '../borrowings.entity';
import { Stocks } from '../stocks.entity';

/**
 * 貸出と貸出状況中のコメントを管理するBorrowingCommentsテーブルのエンティティ
 */

@Entity()
export class BorrowingComments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Borrowings, (borrowing) => borrowing.borrowingComments)
  borrowing: Borrowings;

  @ManyToOne(() => Stocks, (stock) => stock.borrowingComments)
  stock: Stocks;

  @Column()
  comment: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
