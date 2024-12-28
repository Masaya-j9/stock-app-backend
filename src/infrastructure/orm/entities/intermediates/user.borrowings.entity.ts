import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Users } from '../users.entity';
import { Borrowings } from '../borrowings.entity';

/**
 * ユーザー情報と貸出情報を管理するUserBorrowingsテーブルのエンティティ
 */

@Entity()
export class UserBorrowings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.userBorrowings)
  user: Users;

  @ManyToOne(() => Borrowings, (borrowing) => borrowing.userBorrowings)
  borrowing: Borrowings;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;
}
