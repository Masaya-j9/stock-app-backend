import { DomainPrimitive } from '../../../domain.primitive';

export class SortType implements DomainPrimitive<number, SortType> {
  private _sortTypeNumber: number;

  constructor(sortTypeNumber: number) {
    this._sortTypeNumber = sortTypeNumber;
  }

  /**
   * 値を取得する
   * @returns 並び替え順に関する種類の値を返す
   */
  value(): number {
    return this._sortTypeNumber;
  }

  static of(value: number): SortType {
    return new SortType(value);
  }
}
