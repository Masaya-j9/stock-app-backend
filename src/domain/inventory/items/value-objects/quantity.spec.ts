import { Quantity } from './quantity';
import { BadRequestException } from '@nestjs/common';

describe('Quantity', () => {
  const testQuantityInstance = (
    createQuantity: (quantity: number) => Quantity
  ) => {
    it('インスタンスが生成されること', () => {
      const quantity = createQuantity(1);
      expect(quantity).toBeInstanceOf(Quantity);
    });

    it('数量が0以下の場合、エラーをスローすること', () => {
      expect(() => createQuantity(0)).toThrow(BadRequestException);
      expect(() => createQuantity(-1)).toThrow(BadRequestException);
    });
    it('数量が100以上の場合、エラーをスローすること', () => {
      expect(() => createQuantity(101)).toThrow(BadRequestException);
    });

    it('数量が数値ではない場合、エラーをスローすること', () => {
      expect(() => createQuantity('a' as any)).toThrow(BadRequestException);
    });
  };

  describe('of', () => {
    testQuantityInstance(Quantity.of);
  });

  describe('constructor', () => {
    testQuantityInstance(Quantity.of);
  });
  describe('value', () => {
    it('数量が取得できること', () => {
      const quantity = Quantity.of(1);
      expect(quantity.value()).toBe(1);
    });
  });

  describe('isBelowMinimum', () => {
    it('最小許容量を満たしているかどうか', () => {
      const quantity = Quantity.of(1);
      expect(quantity.isBelowMinimum()).toBe(true);
    });
  });

  describe('maxQuantity', () => {
    it('最大許容量を満たしているかどうか', () => {
      const quantity = Quantity.of(100);
      expect(quantity.maxQuantity()).toBe(true);
    });
  });
});
