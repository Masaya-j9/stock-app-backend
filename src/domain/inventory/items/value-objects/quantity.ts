import { BadRequestException } from '@nestjs/common';
import { DomainPrimitive } from '../../../domain.primitive';

/**
 * 物品の数量に関する値オブジェクト
 */

export class Quantity implements DomainPrimitive<number, Quantity> {
  private readonly _quantity: number;
  private readonly MIN_QUANTITY: number = 1;
  private readonly MAX_QUANTITY: number = 100;

  // 在庫レベルの閾値
  private static readonly LOW_STOCK_THRESHOLD = 10;
  private static readonly CRITICAL_STOCK_THRESHOLD = 0;

  private constructor(quantity: number) {
    if (typeof quantity !== 'number') {
      throw new BadRequestException('数量は数値型でなければなりません');
    }
    if (quantity < this.MIN_QUANTITY || quantity > this.MAX_QUANTITY) {
      throw new BadRequestException(
        `数量は ${this.MIN_QUANTITY} 以上 ${this.MAX_QUANTITY} 以下で登録する必要があります`
      );
    }
    this._quantity = quantity;
  }

  value(): number {
    return this._quantity;
  }

  /**
   * 最小許容量を満たしているかどうか
   * @returns true: 最小許容量を満たしている, false: 最小許容量を満たしていない
   */
  isBelowMinimum(): boolean {
    return this._quantity >= this.MIN_QUANTITY;
  }

  /**
   * 最大許容量を満たしているかどうか
   * @returns true: 最大許容量を満たしている, false: 最大許容量を満たしていない
   */
  maxQuantity(): boolean {
    return this._quantity <= this.MAX_QUANTITY;
  }

  // 在庫状態の判定メソッド
  isLowStock(): boolean {
    return this._quantity <= Quantity.LOW_STOCK_THRESHOLD;
  }

  isOutOfStock(): boolean {
    return this._quantity === Quantity.CRITICAL_STOCK_THRESHOLD;
  }

  isWellStocked(): boolean {
    return this._quantity > Quantity.LOW_STOCK_THRESHOLD;
  }

  // 在庫レベルの分類
  getStockLevel(): 'CRITICAL' | 'LOW' | 'NORMAL' | 'HIGH' {
    if (this.isOutOfStock()) return 'CRITICAL';
    if (this.isLowStock()) return 'LOW';
    if (this._quantity < 50) return 'NORMAL';
    return 'HIGH';
  }

  // 在庫要約情報
  getStockSummary(): string {
    if (this.isOutOfStock()) return '在庫切れ';
    if (this.isLowStock()) return '在庫不足';
    return `在庫: ${this._quantity}個`;
  }

  static of(quantity: number): Quantity {
    return new Quantity(quantity);
  }
}
