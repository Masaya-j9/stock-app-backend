import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ItemCategories } from './intermediates/item.categories.entity';

/**
 * 登録される物品を管理するItemテーブルのエンティティ
 *
 */
@Entity()
export class Items {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  description: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => ItemCategories, (itemCategories) => itemCategories.item)
  itemCategories: ItemCategories[];
}