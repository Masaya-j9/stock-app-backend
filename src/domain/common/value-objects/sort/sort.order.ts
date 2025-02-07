import { DomainPrimitive } from '../../../domain.primitive';

export class SortOrder implements DomainPrimitive<number, SortOrder> {
  private _sortOrderNumber: number;

  private constructor(sortOrderNumber: number) {
    this._sortOrderNumber = sortOrderNumber;
  }

  /**
   * 値を取得する
   * @returns 並べ替え順に関する値を返す
   */
  value(): number {
    return this._sortOrderNumber;
  }

  /**
   * sortOrderNumberの値によって、クエリで使用するソート順を返すようにします
   * @returns ソートのクエリを返す(ASC or DESC)
   */
  toQuerySort(): 'ASC' | 'DESC' {
    // 返り値をリテラル型にする
    return this._sortOrderNumber === 0 ? 'ASC' : 'DESC';
  }

  /**
   * 並べ替え順について
   * 0: 昇順(省略された場合はデフォルトとする)
   * 1: 降順
   */

  static of(value: number): SortOrder {
    return new SortOrder(value);
  }
}
