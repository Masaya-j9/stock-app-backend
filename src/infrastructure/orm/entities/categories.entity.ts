import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
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

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ItemCategories, (itemCategories) => itemCategories.category)
  itemCategories: ItemCategories[];

  @Column({ name: 'item_id' })
  itemId: number;
}
