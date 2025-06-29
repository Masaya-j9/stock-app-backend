import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Categories } from '../../orm/entities/categories.entity';
import {
  from,
  map,
  Observable,
  of,
  filter,
  switchMap,
  defaultIfEmpty,
} from 'rxjs';
import { ItemAndCategoryType } from '../../types/item.and.category.type';
import { Pagination } from '../../../domain/common/value-objects/pagination';

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

  /**
   * 論理削除されたアイテムのカテゴリ情報を取得する
   * @param itemIds - アイテムIDの配列
   * @returns Observable<Categories[]> - カテゴリ情報の配列
   */
  findByCategoriesForDeletedItems(itemIds: number[]): Observable<Categories[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'categories.id AS id',
          'categories.name AS name',
          'categories.description AS description',
          'item_categories.item_id AS itemId',
          'categories.created_at AS createdAt',
          'categories.updated_at AS updatedAt',
        ])
        .from('categories', 'categories')
        .withDeleted()
        .innerJoin(
          'item_categories',
          'item_categories',
          'categories.id = item_categories.category_id AND item_categories.deleted_at IS NULL'
        )
        .innerJoin('items', 'items', 'items.id = item_categories.item_id')
        .where('items.id IN (:...itemIds)', { itemIds })
        .andWhere('categories.deleted_at IS NULL')
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

  findCategoryList(pages: number): Observable<Categories[]> {
    const pagination = Pagination.of(pages);
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'categories.id AS id',
          'categories.name AS name',
          'categories.description AS description',
          'categories.createdAt AS createdAt',
          'categories.updatedAt AS updatedAt',
        ])
        .from('categories', 'categories')
        .where('categories.deletedAt IS NULL')
        .orderBy('categories.id', 'ASC')
        .offset(pagination.offset())
        .limit(pagination.itemsPerPage())
        .getRawMany()
    );
  }

  findCategoryByName(name: string): Observable<Categories | undefined> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select(['categories.name AS name'])
        .from('categories', 'categories')
        .where('categories.name = :name', { name })
        .andWhere('categories.deletedAt IS NULL')
        .getRawOne()
    );
  }

  createCategory(
    name: string,
    description: string
  ): Observable<{ id: number }> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Categories)
        .values({
          name,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })
        .execute()
    ).pipe(
      map((result) => {
        const id =
          result.identifiers.length > 0 ? result.identifiers[0].id : null;
        if (id === null) {
          throw new Error('カテゴリーIDが取得できません');
        }
        return { id };
      })
    );
  }

  /**
   * カテゴリーidが一致するカテゴリー情報を取得する
   * 一致しない場合はundefinedを返す
   * @param categoryId
   * @returns {Observable<Categories[]>} - カテゴリー情報
   */

  findByCategoryId(categoryId: number): Observable<Categories | undefined> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'categories.id AS id',
          'categories.name AS name',
          'categories.description AS description',
          'categories.createdAt AS createdAt',
          'categories.updatedAt AS updatedAt',
          'categories.deletedAt AS deletedAt',
        ])
        .from('categories', 'categories')
        .where('categories.id = :id', { id: categoryId })
        .andWhere('categories.deletedAt IS NULL')
        .getRawOne()
    );
  }

  /**
   * カテゴリーidが一致するカテゴリー情報を複数取得する
   * 一致しない場合は空の配列を返す
   *  @param categoryIds
   *  @returns {Observable<Categories[]>} - カテゴリー情報の配列
   */
  findByCategoryIds(categoryIds: number[]): Observable<Categories[]> {
    return of(categoryIds).pipe(
      filter((ids) => !!ids && ids.length > 0),
      switchMap((ids) =>
        from(
          this.dataSource
            .createQueryBuilder()
            .select([
              'categories.id AS id',
              'categories.name AS name',
              'categories.description AS description',
              'categories.createdAt AS createdAt',
              'categories.updatedAt AS updatedAt',
              'categories.deletedAt AS deletedAt',
            ])
            .from('categories', 'categories')
            .where('categories.id IN (:...categoryIds)', { categoryIds: ids })
            .andWhere('categories.deletedAt IS NULL')
            .getRawMany()
        )
      ),
      defaultIfEmpty([])
    );
  }

  /**
   * 入力値のカテゴリー情報を更新する
   * @param id
   * @param name
   * @param description
   * @returns なし
   */

  updateCategory(
    id: number,
    name: string,
    description: string
  ): Observable<void> {
    // 更新するフィールドを直接セット
    const updateFields: Partial<{
      name: string;
      description: string;
      updatedAt: Date;
    }> = {
      name,
      description,
      updatedAt: new Date(), // 更新日時は必ずセット
    };

    // クエリを実行
    return from(
      this.dataSource
        .createQueryBuilder()
        .update(Categories)
        .set(updateFields) // 変更されたフィールドのみを更新
        .where('id = :id', { id })
        .execute()
    ).pipe(
      map(() => {}) // `UpdateResult` を無視して `void` を返す
    );
  }

  /**
   * 入力idに該当するカテゴリー情報を論理削除する
   * @param id
   * @returns なし
   */
  deleteCategory(id: number): Observable<void> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .update(Categories)
        .set({
          updatedAt: new Date(),
          deletedAt: new Date(),
        })
        .where('id = :id', { id })
        .andWhere('deletedAt IS NULL')
        .execute()
    ).pipe(map(() => {}));
  }

  /**
   * itemIdに該当するカテゴリ情報を全件取得する
   * @param itemId
   * @returns {Observable<Categories[]>} - カテゴリー情報の配列
   */
  findCategoriesByItemId(itemId: number): Observable<Categories[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'categories.id AS id',
          'categories.name AS name',
          'categories.description AS description',
          'categories.createdAt AS createdAt',
          'categories.updatedAt AS updatedAt',
          'categories.deletedAt AS deletedAt',
        ])
        .from('categories', 'categories')
        .innerJoin(
          'item_categories',
          'item_categories',
          'categories.id = item_categories.category_id'
        )
        .where('item_categories.item_id = :itemId', { itemId })
        .andWhere('categories.deletedAt IS NULL')
        .getRawMany()
    );
  }
}
