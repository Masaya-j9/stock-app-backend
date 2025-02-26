import { CategoryListOutputBuilder } from './category.list.output.builder';
import { CategoryListOutputDto } from './category.list.output.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { map, of } from 'rxjs';
import { Categories } from '../../../../infrastructure/orm/entities/categories.entity';

describe('CategoryListOutputBuilder', () => {
  const mockCategories: Categories[] = [
    {
      id: 1,
      name: 'Category 1',
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    },
    {
      id: 2,
      name: 'Category 2',
      description: 'Description 2',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    },
  ];
  const mockTotalCount: number = 2;
  describe('mapCategories', () => {
    it('should map categories correctly', (done) => {
      const builder = new CategoryListOutputBuilder(
        mockCategories,
        mockTotalCount
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

  describe('build', () => {
    it('CategoryListOutputDtoを返す', () => {
      const builder = new CategoryListOutputBuilder(
        mockCategories,
        mockTotalCount
      );
      const result = builder.build();
      expect(result).toBeInstanceOf(CategoryListOutputDto);
      expect(result).toEqual({
        count: mockTotalCount,
        categories: mockCategories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
      });
    });
  });
  it('categoriesが空の場合、404エラーを返す', () => {
    const mockTotalCount = 0;
    const builder = new CategoryListOutputBuilder([], mockTotalCount);
    expect(() => builder.build()).toThrow(
      new HttpException('Categories not found', HttpStatus.NOT_FOUND)
    );
  });
});
