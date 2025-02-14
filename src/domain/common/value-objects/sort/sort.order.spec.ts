import { SortOrder } from './sort.order';
import { BadRequestException } from '@nestjs/common';

describe('SortOrder', () => {
  const testSortOrderInstance = (
    createSortOrder: (sortOrderNumber: number) => SortOrder
  ) => {
    it('インスタンスが生成されること', () => {
      const sortOrder = createSortOrder(0);
      expect(sortOrder).toBeInstanceOf(SortOrder);
    });

    it('sortOrderNumberが0未満の場合、エラーをスローすること', () => {
      expect(() => createSortOrder(-1)).toThrow(BadRequestException);
    });

    it('sortOrderNumberがより大きい場合、エラーをスローすること', () => {
      expect(() => createSortOrder(2)).toThrow(BadRequestException);
    });

    it('sortOrderNumberが数値ではない場合、エラーをスローすること', () => {
      expect(() => createSortOrder('a' as any)).toThrow(BadRequestException);
    });
  };

  describe('of', () => {
    testSortOrderInstance(SortOrder.of);
  });

  describe('constructor', () => {
    testSortOrderInstance(SortOrder.of);
  });

  describe('value', () => {
    it('sortOrderNumberが取得できること', () => {
      const sortOrder = SortOrder.of(0);
      expect(sortOrder.value()).toBe(0);
    });
  });

  describe('toQuerySort', () => {
    it('クエリで使用するソート順が取得できること', () => {
      const sortOrder = SortOrder.of(0);
      expect(sortOrder.toQuerySort()).toBe('ASC');
    });
    it('クエリで使用するソート順が取得できること', () => {
      const sortOrder = SortOrder.of(1);
      expect(sortOrder.toQuerySort()).toBe('DESC');
    });

    it('省略されているときはクエリで使用するソート順が取得できること', () => {
      const sortOrder = SortOrder.of(undefined);
      expect(sortOrder.toQuerySort()).toBe('ASC');
    });
  });
});
