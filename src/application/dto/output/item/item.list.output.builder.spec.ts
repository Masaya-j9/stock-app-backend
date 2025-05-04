import { ItemListOutputBuilder } from './item.list.output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';

describe('ItemListOutputBuilder', () => {
  const mockDomainItems: Item[] = [
    new Item(1, 'Item 1', 10, 'Description 1', new Date(), new Date(), null, [
      1,
    ]),
    new Item(2, 'Item 2', 5, 'Description 2', new Date(), new Date(), null, [
      2,
    ]),
  ];
  const mockTotalCount: number = 2;
  const mockTotalPages: number = 1;
  const mockDomainCategories: Category[] = [
    new Category(
      1,
      'Category 1',
      'その他のカテゴリ',
      new Date(),
      new Date(),
      null
    ),
    new Category(
      2,
      'Category 2',
      'その他のカテゴリ',
      new Date(),
      new Date(),
      null
    ),
  ];

  describe('build', () => {
    it('ItemListOutputDtoを返す', () => {
      const builder = new ItemListOutputBuilder(
        mockDomainItems,
        mockTotalCount,
        mockTotalPages,
        mockDomainCategories
      );

      const result = builder.build();
      expect(result).toBeInstanceOf(ItemListOutputDto);
      expect(result.count).toBe(mockTotalCount);
      expect(result.totalPages).toBe(mockTotalPages);
      expect(result.results).toHaveLength(mockDomainItems.length);

      mockDomainItems.forEach((item, index) => {
        const resultItem = result.results[index];

        expect(resultItem.id).toBe(item.id);
        expect(resultItem.name).toBe(item.name);
        expect(resultItem.quantity).toBe(item.quantity);
        expect(resultItem.description).toBe(item.description);

        expect(resultItem.itemsCategories).toHaveLength(1); // 1つのカテゴリが紐づいていることを期待
        const resultCategory = resultItem.itemsCategories[0];

        expect(resultCategory.id).toBe(mockDomainCategories[index].id);
        expect(resultCategory.name).toBe(mockDomainCategories[index].name);
        expect(resultCategory.description).toBe(
          mockDomainCategories[index].description
        );
        expect(resultCategory.createdAt).toBe(
          mockDomainCategories[index].createdAt
        );
        expect(resultCategory.updatedAt).toBe(
          mockDomainCategories[index].updatedAt
        );
      });
    });

    it('itemsが空の場合、404エラーを返す', () => {
      const mockTotalCount = 0;
      const builder = new ItemListOutputBuilder(
        [],
        mockTotalCount,
        mockTotalPages,
        []
      );
      expect(() => builder.build()).toThrow(
        new HttpException('Items not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});
