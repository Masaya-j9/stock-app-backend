import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BorrowingReturns } from './intermediates/borrowing.returns.entity';
import { ReturnStocks } from './intermediates/return.stocks.entity';

/**
 * 返品を管理するReturnsテーブルのエンティティ
 */
@Entity()
export class Returns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  itemId: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // 中間テーブルへのリレーション
  @OneToMany(
    () => BorrowingReturns,
    (borrowingReturns) => borrowingReturns.returns
  )
  borrowingReturns: BorrowingReturns[];

  @OneToMany(() => ReturnStocks, (returnStocks) => returnStocks.returns)
  returnStocks: ReturnStocks[];
}
