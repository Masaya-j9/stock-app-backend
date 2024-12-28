import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Users } from './users.entity';

/**
 * ユーザーの役割を管理するRolesテーブルのエンティティ
 */
@Entity()
export class Roles {
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

  @OneToMany(() => Users, (user) => user.role)
  users: Users[];
}
