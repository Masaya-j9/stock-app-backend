import { DomainPrimitive } from '../../../domain.primitive';
import { BadRequestException } from '@nestjs/common';
export class SortOrder implements DomainPrimitive<number, SortOrder> {
  private _sortOrderNumber: number;

  private constructor(sortOrderNumber: number | undefined) {
    const inputValue: number = sortOrderNumber ?? 0;
    inputValue === 0 || inputValue === 1
      ? (this._sortOrderNumber = inputValue)
      : (() => {
          throw new BadRequestException('Invalid sort order');
        })();
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
   * sortOrderNumberが省略されている場合は、昇順とする
   * @returns ソートのクエリを返す(ASC or DESC)
   */
  toQuerySort(): 'ASC' | 'DESC' {
    return this._sortOrderNumber === 0 || this._sortOrderNumber === undefined
      ? 'ASC'
      : 'DESC';
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
