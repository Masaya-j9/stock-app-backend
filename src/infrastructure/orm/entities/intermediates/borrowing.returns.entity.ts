import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Borrowings } from '../borrowings.entity';
import { Returns } from '../returns.entity';
import { Statuses } from '../statuses.entity';
/**
 * 貸出と返却を管理するBorrowingReturnsテーブルのエンティティ
 */

@Entity()
export class BorrowingReturns {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Borrowings, (borrowing) => borrowing.borrowingReturns)
  @JoinColumn({ name: 'borrowing_id' })
  borrowing: Borrowings;

  @ManyToOne(() => Returns, (returns) => returns.borrowingReturns)
  @JoinColumn({ name: 'return_id' })
  returns: Returns;

  @ManyToOne(() => Statuses, (statues) => statues.borrowingReturns)
  @JoinColumn({ name: 'status_id' })
  statuses: Statuses;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
