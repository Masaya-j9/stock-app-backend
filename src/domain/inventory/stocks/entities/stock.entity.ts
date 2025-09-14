import { Quantity } from '../../items/value-objects/quantity';
import { StockStatus } from './stock.status.entity';
import { randomUUID } from 'crypto';

export class Stock {
  private readonly _id: number | string; // 永続化前はUUID（string）、永続化後はDB ID（number）
  private readonly _quantity: Quantity;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;
  private readonly _itemId: number | null;
  private readonly _status: StockStatus | null;

  constructor(
    id: number | string, // UUIDまたはDB ID
    quantity: Quantity,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    itemId: number | null,
    status: StockStatus | null
  ) {
    this._id = id;
    this._quantity = quantity;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
    this._itemId = itemId;
    this._status = status;
  }

  // Getters
  get id(): number | string {
    return this._id;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get itemId(): number | null {
    return this._itemId;
  }

  get status(): StockStatus | null {
    return this._status;
  }

  /**
   * 新規Stock entityを作成するfactoryメソッド
   * @param itemId - 物品ID
   * @param quantity - 数量
   * @param description - 説明
   * @param status - ステータス
   * @returns Stock - 新規作成されたStockエンティティ
   */
  static create(
    itemId: number,
    quantity: Quantity,
    description: string,
    status: StockStatus
  ): Stock {
    const now = new Date();
    const uuid = randomUUID(); // UUIDを生成

    return new Stock(
      uuid, // 永続化前は一意のUUID
      quantity,
      description,
      now, // createdAt
      now, // updatedAt
      null, // deletedAt
      itemId,
      status
    );
  }

  /**
   * 既存Stock entityを更新するfactoryメソッド
   * @param existingStock - 既存のStockエンティティ
   * @param updates - 更新したい項目のオブジェクト
   * @returns Stock - 更新されたStockエンティティ
   * @throws Error - 永続化されていないStockを更新しようとした場合
   */
  static update(
    existingStock: Stock,
    quantity?: Quantity,
    description?: string,
    status?: StockStatus
  ): Stock {
    // 永続化されたStockのみ更新可能
    if (!existingStock.isPersisted()) {
      throw new Error(
        'Cannot update non-persisted Stock. Only persisted Stock entities can be updated.'
      );
    }

    const now = new Date();

    return new Stock(
      existingStock.id, // 既存のIDを保持
      quantity ?? existingStock.quantity,
      description ?? existingStock.description,
      existingStock.createdAt, // 作成日時は既存のものを保持
      now, // updatedAtのみ現在時刻に更新
      existingStock.deletedAt, // 削除日時も既存のものを保持
      existingStock.itemId,
      status ?? existingStock.status
    );
  }

  /**
   * 永続化されたエンティティかどうかを判定する
   * @returns boolean - 永続化されている場合はtrue
   */
  isPersisted(): boolean {
    return typeof this._id === 'number';
  }

  /**
   * 一時UUIDを持つかどうかを判定する
   * @returns boolean - UUIDの場合はtrue
   */
  hasTemporaryUUID(): boolean {
    return typeof this._id === 'string';
  }

  /**
   * エンティティの同一性を比較する
   * @param other - 比較対象のStockエンティティ
   * @returns boolean - 同一エンティティの場合はtrue
   */
  equals(other: Stock): boolean {
    if (!(other instanceof Stock)) {
      return false;
    }

    return this._id === other._id;
  }
}
