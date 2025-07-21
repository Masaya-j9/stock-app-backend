import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Stocks } from '../../orm/entities/stocks.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';

@Injectable()
export class StocksDatasource {
  constructor(
    @InjectDataSource()
    public readonly dataSource: DataSource
  ) {}

  /**
   * 登録されている在庫の一覧を取得する
   * @param {Pagination} pagination - ページネーション情報
   * @param {SortOrder} sortOrder - ソート順
   * @return {Observable<Stocks[]>} - 登録されている在庫の一覧情報
   */
  findStockList(
    pagination: Pagination,
    sortOrder: SortOrder
  ): Observable<Stocks[]> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('stocks.id', 'id')
        .from('stocks', 'stocks')
        .where('stocks.deleted_at IS NULL')
        .orderBy('stocks.id', sortOrder.toQuerySort())
        .offset(pagination.offset())
        .limit(pagination.itemsPerPage())
        .getRawMany()
    ).pipe(
      map((subStocks) => subStocks.map((stock) => stock.id)),
      switchMap((ids) => {
        if (ids.length === 0) return of([]);

        const fieldOrder = ids.join(',');

        return from(
          this.dataSource
            .createQueryBuilder('stocks', 'stocks')
            .leftJoinAndSelect('stocks.item', 'item')
            .where('stocks.id IN (:...ids)', { ids })
            .andWhere('stocks.deleted_at IS NULL')
            .orderBy(`FIELD(stocks.id, ${fieldOrder})`)
            .getMany()
        );
      })
    );
  }

  /**
   * 登録されている在庫の総数を取得する
   * @return {Observable<number>} - 在庫の総数
   */
  countAll(): Observable<number> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('stocks', 'stocks')
        .where('stocks.deleted_at IS NULL')
        .getRawOne()
    ).pipe(map((result) => parseInt(result.count, 10)));
  }

  /**
   * 物品IDと数量を指定して在庫を更新、または新規作成する
   * @param itemId - 対象の物品ID
   * @param quantity - 設定する数量
   * @param description - 説明文（オプション）
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<Stocks>
   */
  updateStockQuantityByItemId(
    itemId: number,
    quantity: number,
    description?: string,
    transactionalEntityManager?: EntityManager
  ): Observable<Stocks> {
    const queryRunner = transactionalEntityManager || this.dataSource.manager;
    const now = new Date();

    return from(
      queryRunner
        .createQueryBuilder()
        .insert()
        .into(Stocks)
        .values({
          item: { id: itemId },
          quantity: quantity,
          description: description || null,
          createdAt: now,
          updatedAt: now,
        })
        .orUpdate(['quantity', 'description', 'updated_at'], ['item_id'])
        .execute()
    ).pipe(
      switchMap(() =>
        queryRunner
          .createQueryBuilder()
          .select('stocks')
          .from(Stocks, 'stocks')
          .where('stocks.item = :itemId', { itemId })
          .getOne()
      )
    );
  }
}
