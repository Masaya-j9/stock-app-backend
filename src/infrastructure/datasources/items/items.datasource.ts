import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Items } from '../../orm/entities/items.entity';
import { ItemCategories } from '../../orm/entities/intermediates/item.categories.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { from, lastValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';

@Injectable()
export class ItemsDatasource {
  constructor(
    @InjectDataSource()
    public readonly dataSource: DataSource
  ) {}
  /**
   * 登録されている物品の一覧を取得する
   * @param {ItemListInputDto} query - リクエスト情報
   * @return {Observable<ItemListOutputDto>} - 登録されている物品の一覧情報
   */
  findItemList(
    pagination: Pagination,
    sortOrder: SortOrder
  ): Observable<Items[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('items.id', 'id')
        .from('items', 'items')
        .where('items.deleted_at IS NULL')
        .orderBy('items.id', sortOrder.toQuerySort())
        .offset(pagination.offset())
        .limit(pagination.itemsPerPage())
        .getRawMany()
    ).pipe(
      map((subItems) => subItems.map((item) => item.id)),
      switchMap((ids) => {
        if (ids.length === 0) return of([]);

        const fieldOrder = ids.join(',');

        return from(
          this.dataSource
            .createQueryBuilder('items', 'items')
            .select([
              'items.id AS id',
              'items.name AS name',
              'items.quantity AS quantity',
              'items.description AS description',
              'items.created_at AS createdAt',
              'items.updated_at AS updatedAt',
            ])
            .where('items.id IN (:...ids)', { ids })
            .andWhere('items.deleted_at IS NULL')
            .orderBy(`FIELD(items.id, ${fieldOrder})`)
            .getRawMany()
        );
      })
    );
  }

  getTotalCount(itemsIds: number[]): Observable<number> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(items.id)', 'count')
        .from('items', 'items')
        .where('items.id IN (:...itemsIds)', { itemsIds })
        .getRawOne()
    ).pipe(map((result) => Number(result.count)));
  }

  findItemByName(name: string): Observable<Items | undefined> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('*')
        .from(Items, 'items')
        .where('items.name = :name', { name })
        .getRawOne()
    );
  }

  /**
   * 物品IDから物品情報を１件取得するクエリ
   * @param id - 物品ID
   * @returns Observable<Items> - 物品情報
   */
  findItemById(id: number): Observable<Items | undefined> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('*')
        .from(Items, 'items')
        .where('items.id = :id', { id })
        .getRawOne()
    );
  }

  /**
   * 物品IDからカテゴリIDをすべて取得するクエリ
   * @param itemId - 物品IDの配列
   * @returns Observable<number[]> - カテゴリIDの配列
   */
  findCategoryIdsByItemId(itemId: number): Observable<number[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('category_id', 'id')
        .from(ItemCategories, 'item_categories')
        .where('item_categories.item.id = :itemId', { itemId })
        .getRawMany()
    ).pipe(
      map((rows) => {
        return rows.map((row) => row.id);
      })
    );
  }

  /**
   * 物品を1件登録するクエリをトランザクションで実行するクエリ
   * @param item - 登録する物品
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<{ id: number }>
   */
  createItemWithinTransaction(
    name: string,
    quantity: number,
    description: string,
    transactionalEntityManager: EntityManager
  ): Observable<Partial<Items>> {
    return from(
      transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Items)
        .values({
          name: name,
          quantity: quantity,
          description: description,
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
          throw new Error('物品IDが取得できません');
        }
        return {
          id,
          name,
          quantity,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );
  }

  /**
   * 中間テーブルにカテゴリーを追加するトランザクション処理用のクエリ
   * @param itemId
   * @param categoryIds
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<{ id: number }>
   */
  createItemCategoryWithinTransaction(
    itemId: number,
    categoryIds: number[],
    transactionalEntityManager: EntityManager
  ): Observable<{ ids: number[] }> {
    const categoryValues = categoryIds.map((categoryId) => ({
      item: { id: itemId },
      category: { id: categoryId },
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));

    return from(
      transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(ItemCategories)
        .values(categoryValues)
        .execute()
    ).pipe(
      map((result) => {
        const ids = result.identifiers.map(
          (identifier: { id: number }) => identifier.id
        );
        if (ids.length === 0) {
          throw new Error('中間テーブルIDが取得できません');
        }
        return { ids };
      })
    );
  }

  /**
   * 物品情報を更新するクエリ
   * トランザクション処理で実施
   * @param name - 物品名
   * @param quantity - 物品数量
   * @param description - 物品説明
   * @
   */
  updateItemWithinTransactionQuery(
    id: number,
    name: string,
    quantity: number,
    description: string,
    transactionalEntityManager: EntityManager
  ): Observable<Partial<Items>> {
    return from(
      transactionalEntityManager
        .createQueryBuilder()
        .update(Items)
        .set({
          name: name,
          quantity: quantity,
          description: description,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute()
    ).pipe(
      map((result) => {
        const updatedCount = result.affected;
        if (updatedCount === 0) {
          throw new Error('更新された行がありません');
        }
        return {
          id,
          name,
          quantity,
          description,
          updatedAt: new Date(),
        };
      })
    );
  }

  /**
   * 論理削除含めた中間テーブルの既存レコードを取得する
   * @param itemId - 物品ID
   * @param addCategoryIds - 追加カテゴリIDの配列
   */
  findDeletedCategoryIds(
    itemId: number,
    addCategoryIds: number[],
    manager: EntityManager
  ): Observable<number[]> {
    if (!addCategoryIds || addCategoryIds.length === 0) {
      // 空配列なら即空配列を返す
      return new Observable<number[]>((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    const query = manager
      .getRepository(ItemCategories)
      .createQueryBuilder('ic')
      .leftJoinAndSelect('ic.category', 'category')
      .withDeleted()
      .where('ic.item.id = :itemId', { itemId })
      .andWhere('ic.category.id IN (:categoryIds)', {
        categoryIds: addCategoryIds,
      })
      .getMany();

    return from(query).pipe(
      map((existing) =>
        existing
          .filter((ic) => ic.deletedAt !== null)
          .map((ic) => ic.category.id)
      )
    );
  }

  /**
   * 論理削除されたカテゴリを復元する処理 (Observable)
   * @param itemId
   * @param restoreCategoryIds
   * @param manager
   */
  restoreDeletedCategories(
    itemId: number,
    restoreCategoryIds: number[],
    manager: EntityManager
  ): Observable<void> {
    if (restoreCategoryIds.length > 0) {
      const restoreQuery = manager
        .createQueryBuilder()
        .update(ItemCategories)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where('item.id = :itemId AND category.id IN (:categoryIds)', {
          itemId: itemId,
          categoryIds: restoreCategoryIds,
        })
        .execute();

      // Promise を Observable に変換
      return from(restoreQuery).pipe(
        map(() => undefined) // void型を返す
      );
    } else {
      // 復元するカテゴリがない場合も完了
      return new Observable<void>((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }
  }

  /**
   * 新規カテゴリを追加する処理 (Observable)
   * @param itemId
   * @param newInsertCategoryIds
   * @param manager
   */
  addNewCategories(
    itemId: number,
    newInsertCategoryIds: number[],
    manager: EntityManager
  ): Observable<void> {
    if (newInsertCategoryIds.length > 0) {
      const insertQuery = manager
        .createQueryBuilder()
        .insert()
        .into(ItemCategories)
        .values(
          newInsertCategoryIds.map((categoryId) => ({
            item: { id: itemId },
            category: { id: categoryId },
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
        .execute();

      // Promise を Observable に変換
      return from(insertQuery).pipe(
        map(() => undefined) // void型を返す
      );
    } else {
      // 新規追加するカテゴリがない場合も完了
      return new Observable<void>((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }
  }

  /**
   * カテゴリを論理削除する処理 (Observable)
   * @param itemId
   * @param deleteCategoryIds
   * @param manager
   */
  deleteCategories(
    itemId: number,
    deleteCategoryIds: number[],
    manager: EntityManager
  ): Observable<void> {
    if (deleteCategoryIds.length > 0) {
      const deleteQuery = manager
        .createQueryBuilder()
        .update(ItemCategories)
        .set({
          updatedAt: new Date(),
          deletedAt: new Date(),
        })
        .where('item.id = :itemId AND category.id IN (:categoryIds)', {
          itemId: itemId,
          categoryIds: deleteCategoryIds,
        })
        .execute();

      // Promise を Observable に変換
      return from(deleteQuery).pipe(
        // 削除完了時に Observable を完了させる
        map(() => undefined) // void型を返す
      );
    } else {
      // 何も削除するカテゴリがない場合も完了
      return new Observable<void>((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }
  }

  /**
   * 中間テーブルのカテゴリーを取得するクエリ
   * @param itemId
   * @param manager
   * @returns Observable<number[]>
   */
  findUpdatedCategoryIdsByItemId(
    itemId: number,
    manager: EntityManager
  ): Observable<number[]> {
    return from(
      manager
        .createQueryBuilder()
        .select('item_categories.category.id', 'categoryId')
        .from(ItemCategories, 'item_categories')
        .where('item_categories.item.id = :itemId', { itemId })
        .andWhere('item_categories.deleted_at IS NULL')
        .getRawMany()
    ).pipe(map((result) => result.map((item) => item.categoryId)));
  }

  /**
   * 中間テーブルのカテゴリーを更新するクエリ
   * @param itemId -
   * @param addCategoryIds - 追加カテゴリIDの配列
   * @param deleteCategoryIds - 削除カテゴリIDの配列
   * @param transactionalEntityManager - トランザクション用のEntityManager
   */
  updateItemCategoriesWithinTransactionQuery(
    itemId: number,
    addCategoryIds: number[],
    deleteCategoryIds: number[],
    transactionalEntityManager: EntityManager
  ): Observable<{ categoryIds: number[] }> {
    return from(
      transactionalEntityManager.transaction(async (manager) => {
        // 追加更新から復元対象を探す
        const restoreCategoryIds = await lastValueFrom(
          this.findDeletedCategoryIds(itemId, addCategoryIds, manager)
        );

        // 追加更新から復元対象を除外して新規追加カテゴリIDを取得
        const newInsertCategoryIds = addCategoryIds.filter(
          (id) => !restoreCategoryIds.includes(id)
        );

        // 論理削除の復元処理（deletedAt を null に更新）
        await lastValueFrom(
          this.restoreDeletedCategories(itemId, restoreCategoryIds, manager)
        );

        // 新規追加処理
        await lastValueFrom(
          this.addNewCategories(itemId, newInsertCategoryIds, manager)
        );

        // 論理削除処理
        await lastValueFrom(
          this.deleteCategories(itemId, deleteCategoryIds, manager)
        );

        // 更新後のカテゴリID取得
        const updatedCategoryIds = await lastValueFrom(
          this.findUpdatedCategoryIdsByItemId(itemId, manager)
        );

        return { categoryIds: updatedCategoryIds };
      })
    );
  }

  /**
   * 入力IDに該当する物品を論理削除するクエリ
   * @param id - 物品ID
   * @returns Observable<void>
   */
  deletedById(itemId: number): Observable<void> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .update(Items)
        .set({
          updatedAt: new Date(),
          deletedAt: new Date(),
        })
        .where('items.id = :id', { id: itemId })
        .execute()
    ).pipe(
      map(() => undefined) // void型を返す
    );
  }

  /**
   * itemテーブルで論理削除されていないレコードの全件数を取得するクエリ
   * @returns Observable<number>
   */
  countAll(): Observable<number> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(items.id)', 'count')
        .from('items', 'items')
        .where('items.deletedAt IS NULL')
        .getRawOne()
    ).pipe(map((result) => result.count));
  }

  /**
   * itemテーブルに論理削除されているレコードの全件数を取得するクエリ
   * @returns Observable<number>
   */
  countDeletedAll(): Observable<number> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(items.id)', 'count')
        .from('items', 'items')
        .withDeleted()
        .where('items.deleted_at IS NOT NULL')
        .getRawOne()
    ).pipe(map((result) => result.count));
  }

  /**
   * 論理削除された物品の一覧を取得するクエリ
   * @param Pagination - ページネーションに関する値オブジェクト
   * @param sortOrder - ソート順に関する値オブジェクト
   * @returns Observable<Items[]>
   */
  findDeletedItemList(
    pagination: Pagination,
    sortOrder: SortOrder
  ): Observable<Items[]> {
    const subQueryBuilder = this.dataSource
      .createQueryBuilder()
      .select('items_sub.id', 'id')
      .from('items', 'items_sub')
      .withDeleted()
      .where('items_sub.deleted_at IS NOT NULL')
      .orderBy('items_sub.id', 'ASC')
      .offset(pagination.offset())
      .limit(pagination.itemsPerPage());

    const subQuerySql = subQueryBuilder.getQuery();
    const subQueryParams = subQueryBuilder.getParameters();

    // メインクエリでもwithDeleted()を追加
    const mainQueryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        'items.id AS id',
        'items.name AS name',
        'items.quantity AS quantity',
        'items.description AS description',
        'items.created_at AS createdAt',
        'items.updated_at AS updatedAt',
        'items.deleted_at AS deletedAt',
      ])
      .from('items', 'items')
      .withDeleted()
      .innerJoin(`(${subQuerySql})`, 'sub', 'items.id = sub.id')
      .setParameters(subQueryParams)
      .where('items.deleted_at IS NOT NULL')
      .orderBy('items.id', sortOrder.toQuerySort());

    return from(mainQueryBuilder.getRawMany());
  }

  /**
   * 物品IDから論理削除された物品を取得するクエリ
   * @param id - 物品ID
   * @returns Observable<Items | undefined>
   */
  findDeletedItemById(id: number): Observable<Items | undefined> {
    return from(
      this.dataSource
        .getRepository(Items)
        .createQueryBuilder('items')
        .withDeleted()
        .where('items.id = :id', { id })
        .getOne()
    );
  }

  /**
   * 論理削除された物品を復元するクエリ
   * @param id - 物品ID
   * @return Observable<Items>
   */
  //トランザクション処理で実施
  restoreDeletedItemById(
    id: number,
    transactionalEntityManager: EntityManager
  ): Observable<Partial<Items>> {
    return from(
      transactionalEntityManager
        .createQueryBuilder()
        .update(Items)
        .set({
          updatedAt: new Date(),
          deletedAt: null,
        })
        .where('id = :id', { id })
        .execute()
    ).pipe(
      map((result) => {
        if (result.affected === 0) {
          throw new Error('復元された行がありません');
        }
        return {
          id,
          updatedAt: new Date(),
          deletedAt: null,
        };
      })
    );
  }
}
