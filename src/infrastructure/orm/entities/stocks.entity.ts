import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Items } from './items.entity';
import { BorrowingStocks } from './intermediates/borrowing.stocks.entity';
import { ReturnStocks } from './intermediates/return.stocks.entity';
import { StockHistories } from './stock.histories.entity';
import { StockStatuses } from './stock.statuses.entity';

/**
 * 在庫を管理するStocksテーブルのエンティティ
 */
@Entity()
export class Stocks {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Items)
  @JoinColumn({ name: 'item_id' })
  item: Items;

  @Column()
  quantity: number;

  @Column()
  description: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => StockHistories, (stockHistories) => stockHistories.stock)
  stockHistories: StockHistories[];

  //中間テーブルへのリレーション
  @OneToMany(() => BorrowingStocks, (borrowingStocks) => borrowingStocks.stock)
  borrowingStocks: BorrowingStocks;

  @OneToMany(() => ReturnStocks, (returnStocks) => returnStocks.stock)
  returnStocks: ReturnStocks;
  borrowingComments: any;

  @ManyToOne(() => StockStatuses, (status) => status.stocks)
  @JoinColumn({ name: 'status_id' })
  status: StockStatuses;
}
