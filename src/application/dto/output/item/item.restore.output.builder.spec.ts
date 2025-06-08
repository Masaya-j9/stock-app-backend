import { ItemRestoreOutputBuilder } from './item.restore.output.builder';
import { ItemRestoreOutputDto } from './item.restore.output.dto'; // 修正
import { Item } from '../../../../domain/inventory/items/entities/item.entity';

describe('ItemRestoreOutputBuilder', () => {
  const mockDomainItem: Item = new Item(
    1,
    'Item 1',
    10,
    'Description 1',
    new Date(),
    new Date(),
    new Date(),
    [1]
  );

  describe('build', () => {
    it('should return ItemRestoreOutputDto', () => {
      const builder = new ItemRestoreOutputBuilder(mockDomainItem);
      const result = builder.build();

      expect(result).toBeInstanceOf(ItemRestoreOutputDto); // 修正
      expect(result.id).toBe(mockDomainItem.id);
      expect(result.name).toBe(mockDomainItem.name);
      expect(result.quantity).toBe(mockDomainItem.quantity);
      expect(result.description).toBe(mockDomainItem.description);
      expect(result.createdAt).toEqual(mockDomainItem.createdAt);
      expect(result.updatedAt).toEqual(mockDomainItem.updatedAt);
      expect(result.deletedAt).toEqual(mockDomainItem.deletedAt);
    });
  });
});
