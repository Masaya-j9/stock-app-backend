import { Observable } from 'rxjs';
import { Items } from '../../orm/entities/items.entity';

/**
 * ItemsDatasourceInterfaceのDIトークン
 */
export const ITEMS_DATASOURCE_TOKEN = 'ItemsDatasourceInterface' as const;

/**
 * アイテムデータソースのインターフェース
 * アイテムに関する複雑なクエリを担当
 */
export interface ItemsDatasourceInterface {
  /**
   *
   * @param itemIds アイテムIDの配列
   * @returns アイテムIDの配列に基づいてアイテム情報を取得する
   */
  findItemsByIds(itemIds: number[]): Observable<Items[]>;

  /**
   * アイテムIDに基づいてアイテム情報を取得する
   * @param id アイテムID
   * @returns アイテム情報
   */
  findItemById(id: number): Observable<Items | undefined>;
}
