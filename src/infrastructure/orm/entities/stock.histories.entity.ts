import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Stocks } from './stocks.entity';
import { StockHistoryStatuses } from './stock.history.statuses.entity';

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

  //statusはStockHistoryStatusesエンティティを参照する
  @ManyToOne(() => StockHistoryStatuses, (status) => status.stockHistories)
  @JoinColumn({ name: 'stock_history_status_id' })
  status: StockHistoryStatuses;

  @Column()
  quantity: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
