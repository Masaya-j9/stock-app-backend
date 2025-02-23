import { ItemListOutputBuilder } from './item.list.output.builder';
import { ItemListOutputDto } from './item.list.output.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { map, of } from 'rxjs';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';
import { ItemAndCategoryType } from '../../../../infrastructure/types/item.and.category.type';

describe('ItemListOutputBuilder', () => {
  const mockItems: Items[] = [
    {
      id: 1,
      name: 'Item 1',
      description: 'Description 1',
      quantity: 10,
      itemCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: 2,
      name: 'Item 2',
      description: 'Description 2',
      quantity: 5,
      itemCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];
  const mockTotalCount: number = 2;
  const mockCategories: Categories[] = [
    {
      id: 1,
      name: 'Category 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      description: 'その他のカテゴリ',
      itemCategories: [],
    },
    {
      id: 2,
      name: 'Category 2',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      description: 'その他のカテゴリ',
      itemCategories: [],
    },
  ];

  const mockItemAndCategoryIds: ItemAndCategoryType[] = [
    {
      itemId: 1,
      categoryId: 1,
    },
    {
      itemId: 2,
      categoryId: 2,
    },
  ];

  describe('mapCategories', () => {
    it('should map categories correctly', (done) => {
      const builder = new ItemListOutputBuilder(
        mockItems,
        mockTotalCount,
        mockCategories,
        mockItemAndCategoryIds
      );
      of(mockCategories)
        .pipe(
          map((categories) => builder['mapCategories'](categories)) // mapCategoriesを呼び出す
        )
        .subscribe((result) => {
          expect(result).toHaveLength(mockCategories.length);
          result.forEach((category, index) => {
            expect(category.id).toBe(mockCategories[index].id);
            expect(category.name).toBe(mockCategories[index].name);
            expect(category.description).toBe(
              mockCategories[index].description
            );
            expect(category.createdAt).toBe(mockCategories[index].createdAt);
            expect(category.updatedAt).toBe(mockCategories[index].updatedAt);
            expect(category.deletedAt).toBe(mockCategories[index].deletedAt);
          });
          done(); // 非同期テストが完了したことを通知
        });
    });
  });

  describe('mapItems', () => {
    it('should map items correctly', (done) => {
      const builder = new ItemListOutputBuilder(
        mockItems,
        mockTotalCount,
        mockCategories,
        mockItemAndCategoryIds
      );
      of(mockItems)
        .pipe(
          map((items) => builder['mapItems'](items, mockItemAndCategoryIds)) // mapItemsを呼び出す
        )
        .subscribe((result) => {
          expect(result).toHaveLength(mockItems.length);
          result.forEach((item, index) => {
            expect(item.id).toBe(mockItems[index].id);
            expect(item.name).toBe(mockItems[index].name);
            expect(item.quantity).toBe(mockItems[index].quantity);
            expect(item.categoryIds).toEqual(
              mockItemAndCategoryIds
                .filter((itemCategory) => itemCategory.itemId === item.id)
                .map((itemCategory) => itemCategory.categoryId)
            );
          });
          done();
        });
    });
  });

  describe('build', () => {
    it('ItemListOutputDtoを返す', () => {
      const builder = new ItemListOutputBuilder(
        mockItems,
        mockTotalCount,
        mockCategories,
        mockItemAndCategoryIds
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

        expect(resultItem.itemsCategories).toHaveLength(1); // 1つのカテゴリが紐づいていることを期待
        const resultCategory = resultItem.itemsCategories[0];

        expect(resultCategory.id).toBe(mockCategories[index].id);
        expect(resultCategory.name).toBe(mockCategories[index].name);
        expect(resultCategory.description).toBe(
          mockCategories[index].description
        );
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
