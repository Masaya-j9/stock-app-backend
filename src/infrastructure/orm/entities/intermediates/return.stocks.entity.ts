import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Returns } from '../returns.entity';
import { Stocks } from '../stocks.entity';

/**
 * 返却と物品の在庫を管理するReturnStocksテーブルのエンティティ
 */
@Entity()
export class ReturnStocks {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Returns, (returns) => returns.returnStocks)
  @JoinColumn({ name: 'return_id' })
  returns: Returns;

  @ManyToOne(() => Stocks, (stock) => stock.returnStocks)
  @JoinColumn({ name: 'stock_id' })
  stock: Stocks;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;
}
