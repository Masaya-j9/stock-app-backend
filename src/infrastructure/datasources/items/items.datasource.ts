import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Items } from '../../orm/entities/items.entity';
import { ItemCategories } from '../../orm/entities/intermediates/item.categories.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { from, map, Observable } from 'rxjs';
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
   *
   */
  findItemList(page: number, sortOrderNumber: number): Observable<Items[]> {
    const pagination = Pagination.of(page);
    const sortOrder = SortOrder.of(sortOrderNumber);

    const subQuery = this.dataSource
      .createQueryBuilder()
      .select('id')
      .from('items', 'items')
      .where('items.deletedAt IS NULL')
      .orderBy('items.id', 'ASC')
      .offset(pagination.offset())
      .limit(pagination.itemsPerPage());

    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'items.id AS id',
          'items.name AS name',
          'items.quantity AS quantity',
          'items.description AS description',
          'items.createdAt AS createdAt',
          'items.updatedAt AS updatedAt',
        ])
        .from('items', 'items')
        .innerJoin(`(${subQuery.getQuery()})`, 'sub', 'items.id = sub.id')
        .setParameters(subQuery.getParameters())
        .orderBy('items.id', sortOrder.toQuerySort())
        .getRawMany()
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

  findItemByName(name: string): Observable<Items> {
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
}
