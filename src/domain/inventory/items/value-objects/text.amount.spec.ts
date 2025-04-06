import { TextAmount } from './text.amount';
import { BadRequestException } from '@nestjs/common';

describe('TextAmount', () => {
  const testTextAmountInstance = (
    createTextAmount: (text: string) => TextAmount
  ) => {
    it('インスタンスが生成されること', () => {
      const textAmount = createTextAmount('テスト');
      expect(textAmount).toBeInstanceOf(TextAmount);
    });
    it('説明文が1文字以上1000文字以下の場合、インスタンスが生成されること', () => {
      const textAmount = createTextAmount('テスト');
      expect(textAmount).toBeInstanceOf(TextAmount);
    });
    it('説明文が1文字未満の場合、エラーをスローすること', () => {
      expect(() => createTextAmount('')).toThrow(BadRequestException);
    });
    it('説明文が1000文字を超える場合、エラーをスローすること', () => {
      const text = 'a'.repeat(1001);
      expect(() => createTextAmount(text)).toThrow(BadRequestException);
    });

    it('説明文が数値の場合、エラーをスローすること', () => {
      expect(() => createTextAmount(1 as any)).toThrow(BadRequestException);
    });
  };

  describe('of', () => {
    testTextAmountInstance(TextAmount.of);
  });

  describe('constructor', () => {
    testTextAmountInstance(TextAmount.of);
  });
  describe('value', () => {
    it('説明文が取得できること', () => {
      const textAmount = TextAmount.of('テスト');
      expect(textAmount.value()).toBe('テスト');
    });
  });

  describe('isBelowMinimum', () => {
    it('最小許容量を満たしているかどうか', () => {
      const textAmount = TextAmount.of('テスト');
      expect(textAmount.isBelowMinimum()).toBe(true);
    });
  });
  describe('maxQuantity', () => {
    it('最大許容量を満たしているかどうか', () => {
      const textAmount = TextAmount.of('テスト');
      expect(textAmount.maxQuantity()).toBe(true);
    });
  });
});
