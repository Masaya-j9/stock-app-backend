import { Category } from './category.entity';
import { Unique } from '../../../common/value-objects/unique';

jest.mock('../../../common/value-objects/unique', () => ({
  Unique: {
    of: jest.fn(),
  },
}));

describe('Category Entity', () => {
  let category: Category;

  beforeEach(() => {
    category = new Category(
      1,
      'Category 1',
      'Description',
      new Date(),
      new Date(),
      null
    );
    // `Unique.of()` のモックをリセット
    (Unique.of as jest.Mock).mockReset();
  });

  describe('validateUpdate', () => {
    it('name が undefined の場合、false を返す', () => {
      expect(category.validateUpdate(undefined, 'New Description')).toBe(false);
    });

    it('description が undefined の場合、false を返す', () => {
      expect(category.validateUpdate('New Name', undefined)).toBe(false);
    });

    it('name が変更されていて、Unique チェックに失敗した場合、false を返す', () => {
      // Unique モックを正しく作成
      jest.spyOn(Unique, 'of').mockReturnValue({
        _text: 'Duplicate Name',
        value: 'Duplicate Name',
        isDuplicate: () => true,
      } as any);

      expect(category.validateUpdate('Duplicate Name', 'New Description')).toBe(
        false
      );
    });

    it('description が変更されていて、Unique チェックに失敗した場合、false を返す', () => {
      // Unique モックを正しく作成
      jest.spyOn(Unique, 'of').mockReturnValue({
        _text: 'Duplicate Description',
        value: 'Duplicate Description',
        isDuplicate: () => true,
      } as any);

      expect(category.validateUpdate('New Name', 'Duplicate Description')).toBe(
        false
      );
    });

    it('name と description が両方 valid な場合、true を返す', () => {
      // Unique モックを正しく作成
      jest.spyOn(Unique, 'of').mockReturnValue({
        _text: 'New Name',
        value: 'New Name',
        isDuplicate: () => false,
      } as any);

      expect(category.validateUpdate('New Name', 'New Description')).toBe(true);
    });
  });

  describe('update', () => {
    it('validateUpdateが失敗する場合はnullを返す', () => {
      // validateUpdateが失敗する場合 (名前が重複している場合)
      jest.spyOn(Unique, 'of').mockReturnValue({
        isDuplicate: jest.fn().mockReturnValue(true),
      } as any); // anyを使ってモックを強制

      const updatedCategory = category.update('Old Name', 'Old Description');

      expect(updatedCategory).toBeNull();
    });

    it('名前または説明が変更される場合は新しいCategoryを返す', () => {
      // 名前または説明が変更される場合
      jest.spyOn(Unique, 'of').mockReturnValue({
        isDuplicate: () => false,
      } as unknown as Unique);

      const updatedCategory = category.update('New Name', 'New Description');

      expect(updatedCategory).not.toBeNull();
      expect(updatedCategory?.name).toBe('New Name');
      expect(updatedCategory?.description).toBe('New Description');
    });

    it('名前が重複している場合はnullを返す', () => {
      // 名前が重複している場合
      jest.spyOn(Unique, 'of').mockReturnValue({
        isDuplicate: () => true,
      } as unknown as Unique);

      const updatedCategory = category.update('Old Name', 'New Description');

      expect(updatedCategory).toBeNull();
    });
  });
});
