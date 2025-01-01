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
 * 在庫と貸出情報を管理するBorrowingStocksテーブルのエンティティ
 */

@Entity()
export class BorrowingStocks {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Borrowings, (borrowing) => borrowing.borrowingStocks)
  borrowing: Borrowings;

  @ManyToOne(() => Stocks, (stock) => stock.borrowingStocks)
  stock: Stocks;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
