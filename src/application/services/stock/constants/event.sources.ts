/**
 * イベントソースのUnion型定義
 */
export type EventSource =
  | 'item.created'
  | 'item.updated'
  | 'item.deleted'
  | 'item.restored';

/**
 * イベントソース定数
 * RabbitMQのルーティングキーなどで使用される
 */
export const EVENT_SOURCES = {
  ITEM_CREATED: 'item.created',
  ITEM_UPDATED: 'item.updated',
  ITEM_DELETED: 'item.deleted',
  ITEM_RESTORED: 'item.restored',
} as const;

/**
 * イベントソースから在庫ステータスへのマッピング型定義
 */
export type EventSourceToStatusMap = {
  readonly 'item.created': 'available';
  readonly 'item.updated': 'available';
  readonly 'item.restored': 'adjusting';
  readonly 'item.deleted': 'stopped';
};

/**
 * イベントソースから在庫ステータスへのマッピングオブジェクト
 */
export const EVENT_SOURCE_TO_STATUS: EventSourceToStatusMap = {
  'item.created': 'available',
  'item.updated': 'available',
  'item.restored': 'adjusting',
  'item.deleted': 'stopped',
} as const;
