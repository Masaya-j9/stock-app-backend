import { ItemRegisterOutputBuilder } from './item.register.output.builder';
import { ItemRegisterOutputDto } from './item.register.output.dto';

describe('ItemRegisterOutputBuilder', () => {
  const mockId = 1;
  const mockName = 'Item 1';
  const mockQuantity = 10;
  const mockDescription = 'Description 1';
  const mockCreatedAt = new Date();
  const mockUpdatedAt = new Date();
  const mockItemCategories = [
    { id: 1, name: 'Category 1', description: 'Description Category 1' },
    { id: 2, name: 'Category 2', description: 'Description Category 2' },
  ];

  describe('build', () => {
    it('ItemRegisterOutputDtoを返す', () => {
      const builder = new ItemRegisterOutputBuilder(
        mockId,
        mockName,
        mockQuantity,
        mockDescription,
        mockCreatedAt,
        mockUpdatedAt,
        mockItemCategories
      );
      const result = builder.build();
      expect(result).toBeInstanceOf(ItemRegisterOutputDto);
      expect(result.id).toBe(mockId);
      expect(result.name).toBe(mockName);
      expect(result.quantity).toBe(mockQuantity);
      expect(result.description).toBe(mockDescription);
      expect(result.createdAt).toBe(mockCreatedAt);
      expect(result.updatedAt).toBe(mockUpdatedAt);
      expect(result.itemsCategories).toHaveLength(mockItemCategories.length);
    });
  });
});
