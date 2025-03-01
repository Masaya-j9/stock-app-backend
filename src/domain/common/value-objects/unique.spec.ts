import { Unique } from './unique';
import { ConflictException } from '@nestjs/common';

describe('Unique', () => {
  const testUniqueInstance = (
    createUnique: (text: string, existingText?: string) => Unique
  ) => {
    it('インスタンスが生成されること', () => {
      const unique = createUnique('text');
      expect(unique).toBeInstanceOf(Unique);
    });

    it('テキストが取得できること', () => {
      const unique = createUnique('text');
      expect(unique.value()).toBe('text');
    });

    it('テキストが重複している場合、ConflictExceptionをスローすること', () => {
      expect(() => createUnique('text', 'text')).toThrow(ConflictException);
    });

    it('テキストが重複していない場合、エラーをスローしないこと', () => {
      expect(() => createUnique('text', 'other text')).not.toThrow(
        ConflictException
      );
    });
  };

  describe('of', () => {
    testUniqueInstance(Unique.of);
  });

  describe('constructor', () => {
    testUniqueInstance(Unique.of);
  });

  describe('value', () => {
    it('テキストが取得できること', () => {
      const unique = Unique.of('text');
      expect(unique.value()).toBe('text');
    });
  });

  describe('isDuplicate', () => {
    it('テキストが重複している場合、trueを返すこと', () => {
      const unique = Unique.of('text');
      expect(unique.isDuplicate('text')).toBe(true);
    });

    it('テキストが重複していない場合、falseを返すこと', () => {
      const unique = Unique.of('text');
      expect(unique.isDuplicate('other text')).toBe(false);
    });
  });
});
