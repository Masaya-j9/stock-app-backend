import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Stocks } from '../../orm/entities/stocks.entity';
import { StockStatuses } from '../../orm/entities/stock.statuses.entity';
import { Stock } from '../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../domain/inventory/stocks/entities/stock.status.entity';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import { StocksDatasourceInterface } from './stocks.datasource.interface';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';

@Injectable()
export class StocksDatasource implements StocksDatasourceInterface {
  constructor(
    @InjectDataSource()
    public readonly dataSource: DataSource
  ) {}

  /**
   * ORMエンティティをドメインエンティティに変換する
   * @param stocksEntity - ORMの在庫エンティティ
   * @returns ドメインの在庫エンティティ
   */
  private convertToDomainEntity(stocksEntity: Stocks): Stock {
    const stockStatus = stocksEntity.status
      ? new StockStatus(
          stocksEntity.status.id,
          stocksEntity.status.name,
          stocksEntity.status.description || '',
          stocksEntity.status.createdAt,
          stocksEntity.status.updatedAt,
          stocksEntity.status.deletedAt
        )
      : null;

    return new Stock(
      stocksEntity.id,
      Quantity.of(stocksEntity.quantity),
      stocksEntity.description || '',
      stocksEntity.createdAt,
      stocksEntity.updatedAt,
      stocksEntity.deletedAt,
      stocksEntity.item?.id || null,
      stockStatus
    );
  }

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
            .leftJoinAndSelect('stocks.status', 'status')
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
  createStockQuantityByItemId(
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
          .where('stocks.item_id = :itemId', { itemId })
          .getOne()
      )
    );
  }

  /**
   * ステータス名と一致するStockStatusesレコードを取得する
   * @param name - ステータス名
   * @returns Observable<StockStatuses | undefined> - StockStatusesエンティティまたはundefined
   */
  getStatusByName(name: string): Observable<StockStatuses | undefined> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('stock_statuses')
        .from(StockStatuses, 'stock_statuses')
        .where('stock_statuses.name = :name', { name })
        .getOne()
    );
  }

  /**
   * トランザクション内でステータスIDを指定して在庫を作成・更新する
   * 永続化されたstockIdのみを返す
   * @param itemId - 物品ID
   * @param quantity - 数量
   * @param statusId - ステータスID
   * @param description - 説明文（オプション）
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<number> - 永続化されたstock ID
   */
  createStockWithStatusIdInTransaction(
    itemId: number,
    quantity: number,
    statusId: number,
    description?: string,
    transactionalEntityManager?: EntityManager
  ): Observable<number> {
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
          status: { id: statusId },
          createdAt: now,
          updatedAt: now,
        })
        .orUpdate(
          ['quantity', 'description', 'status_id', 'updated_at'],
          ['item_id']
        )
        .execute()
    ).pipe(
      switchMap((insertResult) => {
        // INSERTの場合は新しいIDを取得、UPDATEの場合は既存のレコードを検索
        const stockId =
          insertResult.identifiers?.[0]?.id || insertResult.raw?.insertId;

        if (stockId) {
          // 新規作成された場合：stockIdのみを返す
          return of(stockId);
        } else {
          // 更新された場合：既存のレコードのIDを返す
          return this.findStockByItemId(itemId, queryRunner).pipe(
            map((stocksEntity) => {
              if (!stocksEntity) {
                throw new Error(`Stock with item ID ${itemId} not found`);
              }
              return stocksEntity.id;
            })
          );
        }
      })
    );
  }

  /**
   * 物品IDと数量、ステータスを指定して在庫を更新、または新規作成する
   * @param itemId - 対象の物品ID
   * @param quantity - 設定する数量
   * @param description - 説明文（オプション）
   * @param status - ステータス（オプション）
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<Stocks>
   */
  createStockQuantityByItemIdWithStatus(
    itemId: number,
    quantity: number,
    description?: string,
    status?: string,
    transactionalEntityManager?: EntityManager
  ): Observable<Stocks> {
    const queryRunner = transactionalEntityManager || this.dataSource.manager;
    const now = new Date();
    const statusName = status || 'PENDING';

    return this.getStatusByName(statusName).pipe(
      switchMap((stockStatus) => {
        if (!stockStatus) {
          throw new Error(`Status '${statusName}' not found`);
        }
        return this.createStockWithStatusId(
          itemId,
          quantity,
          stockStatus.id,
          description,
          queryRunner,
          now
        );
      }),
      switchMap(() => this.findStockByItemId(itemId, queryRunner))
    );
  }

  /**
   * ステータスIDを指定して在庫を作成・更新する
   * @param itemId - 物品ID
   * @param quantity - 数量
   * @param statusId - ステータスID
   * @param description - 説明文
   * @param queryRunner - クエリランナー
   * @param now - 現在時刻
   * @returns Observable<any>
   */
  private createStockWithStatusId(
    itemId: number,
    quantity: number,
    statusId: number,
    description: string | null,
    queryRunner: EntityManager,
    now: Date
  ): Observable<any> {
    return from(
      queryRunner
        .createQueryBuilder()
        .insert()
        .into(Stocks)
        .values({
          item: { id: itemId },
          quantity: quantity,
          description: description,
          status: { id: statusId },
          createdAt: now,
          updatedAt: now,
        })
        .orUpdate(
          ['quantity', 'description', 'status_id', 'updated_at'],
          ['item_id']
        )
        .execute()
    );
  }

  /**
   * 物品IDで在庫を取得する
   * @param itemId - 物品ID
   * @param queryRunner - クエリランナー
   * @returns Observable<Stocks>
   */
  private findStockByItemId(
    itemId: number,
    queryRunner: EntityManager
  ): Observable<Stocks> {
    return from(
      queryRunner
        .createQueryBuilder()
        .select('stocks')
        .from(Stocks, 'stocks')
        .leftJoinAndSelect('stocks.status', 'status')
        .where('stocks.item_id = :itemId', { itemId })
        .getOne()
    );
  }

  /**
   * 物品IDと数量を指定して、既存の在庫情報を更新
   * @param itemId - 物品ID
   * @param quantity - 更新する数量
   * @param description - 更新する説明文
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<Stocks>
   */
  updateStockQuantityByItemId(
    itemId: number,
    quantity: number,
    description: string
  ): Observable<void> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .update(Stocks)
        .set({
          quantity: quantity,
          description: description,
          updatedAt: new Date(),
        })
        .where('item_id = :itemId', { itemId }) // stocks.item を item_id に修正
        .execute()
    ).pipe(map(() => undefined));
  }

  /**
   * 物品IDと数量のみを指定して、既存の在庫情報を更新
   * @param itemId - 物品ID
   * @param quantity - 更新する数量
   * @param transactionalEntityManager - トランザクション用のEntityManager
   * @returns Observable<Stocks>
   */
  updateStockQuantityOnlyById(
    itemId: number,
    quantity: number
  ): Observable<void> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .update(Stocks)
        .set({
          quantity: quantity,
          updatedAt: new Date(),
        })
        .where('item_id = :itemId', { itemId }) // stocks.item を item_id に修正
        .execute()
    ).pipe(map(() => undefined));
  }

  /**
   * 物品IDをを指定して在庫情報を論理削除
   * @param itemId - 対象の物品ID
   * @returns Observable<void>
   */
  deletedByItemId(itemId: number): Observable<void> {
    const now = new Date();
    return from(
      this.dataSource
        .getRepository(Stocks)
        .createQueryBuilder('stocks')
        .update(Stocks)
        .set({
          updatedAt: now,
          deletedAt: now,
        })
        .where('item_id = :itemId AND deleted_at IS NULL', { itemId })
        .execute()
    ).pipe(
      map((result) => {
        console.log(`[StocksDatasource] Executed query with result:`, result);
        return undefined;
      })
    );
  }

  /**
   * 物品IDと在庫を指定して、論理削除されている在庫を復元
   */
  restoreStockByItemId(
    itemId: number,
    quantity: number,
    transactionalEntityManager?: EntityManager
  ): Observable<void> {
    const queryRunner = transactionalEntityManager || this.dataSource.manager;
    return from(
      queryRunner
        .createQueryBuilder()
        .update(Stocks)
        .set({
          quantity: quantity,
          updatedAt: new Date(),
          deletedAt: null,
        })
        .where('item_id = :itemId AND deleted_at IS NOT NULL', { itemId })
        .execute()
    ).pipe(
      map(() => {
        console.log(`[StocksDatasource] Stock restored for item ID: ${itemId}`);
      })
    );
  }
}
