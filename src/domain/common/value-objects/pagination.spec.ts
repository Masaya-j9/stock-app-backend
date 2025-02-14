//Unitテストをコードをかく

import { Pagination } from './pagination';
import { BadRequestException } from '@nestjs/common';
describe('Pagination', () => {
  const testPaginationInstance = (
    createPagination: (pageNumber: number) => Pagination
  ) => {
    it('インスタンスが生成されること', () => {
      const pagination = createPagination(1);
      expect(pagination).toBeInstanceOf(Pagination);
    });

    it('ページ番号が0以下の場合、エラーをスローすること', () => {
      expect(() => createPagination(0)).toThrow(BadRequestException);
      expect(() => createPagination(-1)).toThrow(BadRequestException);
    });

    it('ページ番号が数値ではない場合、エラーをスローすること', () => {
      expect(() => createPagination('a' as any)).toThrow(BadRequestException);
    });
  };
  describe('of', () => {
    testPaginationInstance(Pagination.of);
  });

  describe('constructor', () => {
    testPaginationInstance(Pagination.of);
  });

  describe('value', () => {
    it('ページ番号が取得できること', () => {
      const pagination = Pagination.of(1);
      expect(pagination.value()).toBe(1);
    });
  });

  describe('offset', () => {
    it('offsetが計算できること', () => {
      const pagination = Pagination.of(1);
      expect(pagination.offset()).toBe(0);
    });

    it('ページ番号が0以下の場合、エラーをスローすること', () => {
      expect(() => Pagination.of(0)).toThrow(BadRequestException);
      expect(() => Pagination.of(-1)).toThrow(BadRequestException);
    });

    it('ページ番号が設定されていない場合、エラーをスローすること', () => {
      expect(() => Pagination.of(undefined as any)).toThrow(
        BadRequestException
      );
    });

    it('ページ番号が数値ではない場合、エラーをスローすること', () => {
      expect(() => Pagination.of('a' as any)).toThrow(BadRequestException);
    });
  });

  describe('itemsPerPage', () => {
    it('1ページあたりの件数が取得できること', () => {
      const pagination = Pagination.of(1);
      expect(pagination.itemsPerPage()).toBe(10);
    });

    it('ページ番号が0以下の場合、エラーをスローすること', () => {
      const pagination = Pagination.of(1);
      expect(pagination.itemsPerPage()).toBe(10);
    });
  });
});
