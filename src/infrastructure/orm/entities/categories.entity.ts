import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ItemCategories } from './intermediates/item.categories.entity';

/**
 * 物品のカテゴリを管理するCategoriesテーブルのエンティティ
 *
 */
@Entity()
export class Categories {
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

  @Column({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => ItemCategories, (itemCategories) => itemCategories.category)
  itemCategories: ItemCategories[];
}
