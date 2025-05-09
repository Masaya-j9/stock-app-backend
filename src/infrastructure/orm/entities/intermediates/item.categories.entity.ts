import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Items } from '../items.entity';
import { Categories } from '../categories.entity';

/**
 * itemテーブルとCategoryテーブルを紐付けるItemCategoriesテーブルのエンティティ
 */
@Entity()
export class ItemCategories {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Items, (item) => item.itemCategories)
  @JoinColumn({ name: 'item_id' })
  item: Items;

  @ManyToOne(() => Categories, (category) => category.itemCategories)
  @JoinColumn({ name: 'category_id' })
  category: Categories;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
