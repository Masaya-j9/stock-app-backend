import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BorrowingReturns } from './intermediates/borrowing.returns.entity';
/**
 * 貸出状況をラベルを管理するStatuesテーブルのエンティティ
 */

@Entity()
export class Statuses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => BorrowingReturns,
    (borrowingReturns) => borrowingReturns.statuses
  )
  borrowingReturns: BorrowingReturns[];
}
