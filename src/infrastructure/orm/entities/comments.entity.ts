import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { UserComments } from './intermediates/user.comments.entity';
import { BorrowingComments } from './intermediates/borrowing.comments.entity';

/**
 * コメントを管理するCommentsテーブルのエンティティ
 */

@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => UserComments, (userComment) => userComment.comment)
  userComments: UserComments[];

  @OneToMany(
    () => BorrowingComments,
    (borrowingComment) => borrowingComment.comment
  )
  borrowingComments: BorrowingComments[];
}
