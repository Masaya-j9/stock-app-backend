import { ItemUpdateOutputBuilder } from './item.update.output.builder';
import { ItemUpdateOutputDto } from './item.update.output.dto';

describe('ItemUpdateOutputBuilder', () => {
  const mockId = 1;
  const mockName = 'Item 1';
  const mockQuantity = 10;
  const mockDescription = 'Description 1';
  const mockUpdatedAt = new Date();
  const mockItemCategories = [
    { id: 1, name: 'Category 1', description: 'Description Category 1' },
    { id: 2, name: 'Category 2', description: 'Description Category 2' },
  ];

  describe('build', () => {
    it('ItemUpdateOutputDtoを返す', () => {
      const builder = new ItemUpdateOutputBuilder(
        mockId,
        mockName,
        mockQuantity,
        mockDescription,
        mockUpdatedAt,
        mockItemCategories
      );
      const result = builder.build();
      expect(result).toBeInstanceOf(ItemUpdateOutputDto);
      expect(result.id).toBe(mockId);
      expect(result.name).toBe(mockName);
      expect(result.quantity).toBe(mockQuantity);
      expect(result.description).toBe(mockDescription);
      expect(result.updatedAt).toBe(mockUpdatedAt);
      expect(result.itemCategories).toHaveLength(mockItemCategories.length);
    });
  });
});
