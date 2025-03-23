import { CategoryListOutputBuilder } from './category.list.output.builder';
import { CategoryListOutputDto } from './category.list.output.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';

describe('CategoryListOutputBuilder', () => {
  const mockDomainCategories: Category[] = [
    new Category(
      1,
      'Category 1',
      'Description 1',
      new Date(),
      new Date(),
      null
    ),
    new Category(
      2,
      'Category 2',
      'Description 2',
      new Date(),
      new Date(),
      null
    ),
  ];
  const mockTotalCount: number = 2;

  describe('build', () => {
    it('CategoryListOutputDtoを返す', () => {
      const builder = new CategoryListOutputBuilder(
        mockDomainCategories,
        mockTotalCount
      );
      const result = builder.build();
      expect(result).toBeInstanceOf(CategoryListOutputDto);
      expect(result.count).toBe(mockTotalCount);
      expect(result.categories).toHaveLength(mockDomainCategories.length);
      mockDomainCategories.forEach((category, index) => {
        expect(result.categories[index].id).toBe(category.id);
        expect(result.categories[index].name).toBe(category.name);
        expect(result.categories[index].description).toBe(category.description);
        expect(result.categories[index].createdAt).toBe(category.createdAt);
        expect(result.categories[index].updatedAt).toBe(category.updatedAt);
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
});
