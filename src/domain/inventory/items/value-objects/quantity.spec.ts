import { Quantity } from './quantity';

describe('Quantity', () => {
  // バリデーションテスト
  describe('バリデーション', () => {
    it('正常な値で生成できる', () => {
      expect(() => Quantity.of(10)).not.toThrow();
      expect(Quantity.of(10).value()).toBe(10);
    });

    it('最小値未満の場合は例外をスロー', () => {
      expect(() => Quantity.of(0)).toThrow();
      expect(() => Quantity.of(-1)).toThrow();
    });

    it('最大値超過の場合は例外をスロー', () => {
      expect(() => Quantity.of(101)).toThrow();
      expect(() => Quantity.of(1000)).toThrow();
    });

    it('数値以外の場合は例外をスロー', () => {
      expect(() => Quantity.of('abc' as any)).toThrow();
      expect(() => Quantity.of(null as any)).toThrow();
    });
  });

  // --- 追加ロジックのテスト ---
  describe('在庫判定ロジック', () => {
    it('isLowStock: 10以下はtrue, 11以上はfalse', () => {
      expect(Quantity.of(10).isLowStock()).toBe(true);
      expect(Quantity.of(1).isLowStock()).toBe(true);
      expect(Quantity.of(11).isLowStock()).toBe(false);
    });

    it('isOutOfStock: 0はtrue, 1以上はfalse', () => {
      // 0はそもそも生成できないので、1はfalse
      expect(Quantity.of(1).isOutOfStock()).toBe(false);
    });

    it('isWellStocked: 11以上はtrue, 10以下はfalse', () => {
      expect(Quantity.of(11).isWellStocked()).toBe(true);
      expect(Quantity.of(10).isWellStocked()).toBe(false);
    });

    it('getStockLevel: 0→CRITICAL, 1-10→LOW, 11-49→NORMAL, 50以上→HIGH', () => {
      // 0は生成不可
      expect(Quantity.of(1).getStockLevel()).toBe('LOW');
      expect(Quantity.of(10).getStockLevel()).toBe('LOW');
      expect(Quantity.of(11).getStockLevel()).toBe('NORMAL');
      expect(Quantity.of(49).getStockLevel()).toBe('NORMAL');
      expect(Quantity.of(50).getStockLevel()).toBe('HIGH');
      expect(Quantity.of(100).getStockLevel()).toBe('HIGH');
    });

    it('getStockSummary: 在庫切れ/在庫不足/在庫:xx個', () => {
      expect(Quantity.of(1).getStockSummary()).toBe('在庫不足');
      expect(Quantity.of(10).getStockSummary()).toBe('在庫不足');
      expect(Quantity.of(11).getStockSummary()).toBe('在庫: 11個');
    });
  });
});
