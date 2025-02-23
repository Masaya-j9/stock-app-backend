import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Categories } from '../../orm/entities/categories.entity';
import { from, Observable } from 'rxjs';
import { ItemAndCategoryType } from '../../types/item.and.category.type';

@Injectable()
export class CategoriesDatasource {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  /**
   * 登録されている物品のカテゴリー名を取得する
   * @param itemsIdsIds 物品IDの配列
   * @returns {Observable<Categories[]>} - カテゴリー名の配列
   */

  findByCategories(itemIds: number[]): Observable<Categories[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'categories.id AS id',
          'categories.name AS name',
          'itemCategories.item_id AS itemId',
          'categories.createdAt AS createdAt',
          'categories.updatedAt AS updatedAt',
        ])
        .from('categories', 'categories')
        .innerJoin('categories.itemCategories', 'itemCategories')
        .innerJoin('itemCategories.item', 'items')
        .where('items.id IN (:...itemIds)', { itemIds })
        .andWhere('categories.deletedAt IS NULL')
        .getRawMany()
    );
  }

  findCategoryIdsAndItemIds(
    itemIds: number[]
  ): Observable<ItemAndCategoryType[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'item_categories.item_id AS itemId',
          'item_categories.category_id AS categoryId',
        ])
        .from('item_categories', 'item_categories')
        .where('item_categories.item_id IN (:...itemIds)', { itemIds })
        .andWhere('item_categories.deleted_at IS NULL')
        .orderBy('item_categories.item_id', 'ASC')
        .getRawMany()
    );
  }
}
