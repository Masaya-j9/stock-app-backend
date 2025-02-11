import { ItemListOutputBuilder } from './item.list.output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ItemListOutputBuilder', () => {
  describe('build', () => {
    const mockItems: Items[] = [
      {
        id: 1,
        name: 'item1',
        quantity: 1,
        description: 'description1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      },
      {
        id: 2,
        name: 'item2',
        quantity: 2,
        description: 'description2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      },
    ];

    const mockCategories: Categories[] = [
      {
        id: 1,
        name: 'category1',
        description: 'description1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemId: 1,
        itemCategories: [],
      },
      {
        id: 2,
        name: 'category2',
        description: 'description2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemId: 2,
        itemCategories: [],
      },
    ];

    const mockTotalCount = 2;

    const mockConvertCategories = mockCategories.map(
      (category) =>
        new Category(
          category.id,
          category.name,
          category.description,
          category.itemId,
          category.createdAt,
          category.updatedAt,
          category.deletedAt
        )
    );

    it('ItemListOutputDtoを返す', () => {
      const builder = new ItemListOutputBuilder(
        mockItems,
        mockTotalCount,
        mockConvertCategories
      );

      const result = builder.build();

      expect(result).toBeInstanceOf(ItemListOutputDto);
      expect(result.count).toBe(mockTotalCount);
      expect(result.results).toHaveLength(mockItems.length);
      mockItems.forEach((item, index) => {
        const resultItem = result.results[index];
        expect(resultItem.id).toBe(item.id);
        expect(resultItem.name).toBe(item.name);
        expect(resultItem.quantity).toBe(item.quantity);
        expect(resultItem.description).toBe(item.description);

        expect(resultItem.itemsCategories).toHaveLength(1);
        const resultCategory = resultItem.itemsCategories[0];
        expect(resultCategory.id).toBe(mockCategories[index].id);
        expect(resultCategory.name).toBe(mockCategories[index].name);
        expect(resultCategory.description).toBe(
          mockCategories[index].description
        );
        expect(resultCategory.itemId).toBe(mockCategories[index].itemId);
        expect(resultCategory.createdAt).toBe(mockCategories[index].createdAt);
        expect(resultCategory.updatedAt).toBe(mockCategories[index].updatedAt);
      });
    });

    it('itemsが空の場合、404エラーを返す', () => {
      const mockTotalCount = 0;
      const builder = new ItemListOutputBuilder([], mockTotalCount, []);
      expect(() => builder.build()).toThrow(
        new HttpException('Items not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});
