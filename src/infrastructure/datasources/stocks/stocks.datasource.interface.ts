import { Observable } from 'rxjs';
import { Stocks } from '../../orm/entities/stocks.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';
import { EntityManager } from 'typeorm';

/**
 * StocksDatasourceInterfaceのDIトークン
 */
export const STOCKS_DATASOURCE_TOKEN = 'StocksDatasourceInterface' as const;

/**
 * 在庫データソースのインターフェース
 * 複雑なクエリ、集計、結合操作を担当
 */
export interface StocksDatasourceInterface {
  /**
   * 在庫一覧を取得する（ページネーション、ソート付き）
   */
  findStockList(
    pagination: Pagination,
    sortOrder: SortOrder
  ): Observable<Stocks[]>;

  /**
   * 在庫の総数を取得する
   */
  countAll(): Observable<number>;

  /**
   * 物品IDと数量を指定して在庫を更新、または新規作成する
   */
  createStockQuantityByItemId(
    itemId: number,
    quantity: number,
    description?: string,
    transactionalEntityManager?: EntityManager
  ): Observable<Stocks>;

  /**
   * 物品IDと数量を指定して、既存の在庫情報を更新
   */
  updateStockQuantityByItemId(
    itemId: number,
    quantity: number,
    description: string
  ): Observable<void>;

  /**
   * 物品IDと数量のみを指定して、既存の在庫情報を更新
   */
  updateStockQuantityOnlyById(
    itemId: number,
    quantity: number
  ): Observable<void>;

  /**
   * 物品IDをを指定して在庫情報を論理削除
   */
  deletedByItemId(itemId: number): Observable<void>;

  /**
   * 物品IDと在庫を指定して、論理削除されている在庫を復元
   */
  restoreStockByItemId(
    itemId: number,
    quantity: number,
    transactionalEntityManager?: EntityManager
  ): Observable<void>;
}
