import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserComments } from './intermediates/user.coments.entity';

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

  @OneToMany(() => UserComments, (userComment) => userComment.comment)
  userComments: UserComments[];
}
