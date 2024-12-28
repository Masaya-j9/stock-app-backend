import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from '../users.entity';
import { Comments } from '../comments.entity';

/**
 * ユーザーのコメントを管理するUserCommentsテーブルのエンティティ
 */

@Entity()
export class UserComments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.userComments)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Comments, (comment) => comment.userComments)
  @JoinColumn({ name: 'comment_id' })
  comment: Comments;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;
}
