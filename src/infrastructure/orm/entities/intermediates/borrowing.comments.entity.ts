import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Borrowings } from '../borrowings.entity';
import { Comments } from '../comments.entity';

/**
 * 貸出と貸出状況中のコメントを管理するBorrowingCommentsテーブルのエンティティ
 */

@Entity()
export class BorrowingComments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Borrowings, (borrowing) => borrowing.borrowingComments)
  @JoinColumn({ name: 'borrowing_id' })
  borrowing: Borrowings;

  @ManyToOne(() => Comments, (comment) => comment.borrowingComments)
  @JoinColumn({ name: 'comment_id' })
  comment: Comments;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
