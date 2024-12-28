import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Roles } from './roles.entity';
import { UserComments } from './intermediates/user.coments.entity';
import { UserBorrowings } from './intermediates/user.borrowings.entity';

/**
 * ユーザーの情報を管理するUsersテーブルのエンティティ
 */
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  //中間テーブルへのリレーション
  @OneToMany(() => UserComments, (userComment) => userComment.user)
  userComments: UserComments[];

  @OneToMany(() => UserBorrowings, (userBorrowing) => userBorrowing.user)
  userBorrowings: UserBorrowings[];
}
