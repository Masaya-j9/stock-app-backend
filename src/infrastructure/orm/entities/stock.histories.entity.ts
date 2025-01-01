import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Stocks } from './stocks.entity';

/**
 * 在庫の履歴を管理するStockHistoriesテーブルのエンティティ
 */

@Entity()
export class StockHistories {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Stocks, (stock) => stock.stockHistories)
  @JoinColumn({ name: 'stock_id' })
  stock: Stocks;

  @Column()
  quantity: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
