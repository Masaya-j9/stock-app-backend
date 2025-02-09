import { DomainPrimitive } from '../../domain.primitive';
import { BadRequestException } from '@nestjs/common';
/**
 * 一覧表示の際のページネーションを表す値オブジェクト
 * 10件ずつ表示する
 */

export class Pagination implements DomainPrimitive<number, Pagination> {
  private readonly ITEM_PER_PAGE: number = 10;
  private _pageNumber: number;

  private constructor(pageNumber: number) {
    typeof pageNumber === 'number' && pageNumber > 0
      ? (this._pageNumber = pageNumber)
      : (() => {
          throw new BadRequestException('Invalid page number');
        })();
  }

  /**
   * 値を取得する
   * @returns page番号を返す
   */
  value(): number {
    return this._pageNumber;
  }

  /**
   * ページ番号からoffsetを計算する
   * @returns offset値
   */
  offset(): number {
    return (this._pageNumber - 1) * this.ITEM_PER_PAGE;
  }

  /**
   * @returns 1ページあたりの件数
   */

  itemsPerPage(): number {
    return this.ITEM_PER_PAGE;
  }

  /**
   * Paginationインスタンスを生成する
   * @param value ページ番号
   * @returns Paginationインスタンス
   */
  static of(value: number): Pagination {
    return new Pagination(value);
  }
}
