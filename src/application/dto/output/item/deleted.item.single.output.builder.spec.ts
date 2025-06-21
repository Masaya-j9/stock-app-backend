import { DeletedItemSingleOutputBuilder } from './deleted.item.single.output.builder';
import { DeletedItemSingleOutputDto } from './deleted.item.single.output.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Item } from '../../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../../domain/inventory/items/entities/category.entity';

describe('DeletedItemSingleOutputBuilder', () => {
  const now = new Date();
  const mockDomainItem: Item = new Item(
    1,
    'Item 1',
    10,
    'Description 1',
    now,
    now,
    now,
    [1]
  );
  const mockDomainCategories: Category[] = [
    new Category(1, 'Category 1', 'その他のカテゴリ', now, now, null),
  ];
  const mockOutput: DeletedItemSingleOutputDto = {
    id: 1,
    name: 'Item 1',
    quantity: 10,
    description: 'Description 1',
    createdAt: now,
    updatedAt: now,
    deletedAt: now,
    itemCategories: [
      {
        id: 1,
        name: 'Category 1',
        description: 'その他のカテゴリ',
      },
    ],
  };

  describe('build', () => {
    it('DeletedItemSingleOutputDtoを返す', () => {
      const builder = new DeletedItemSingleOutputBuilder(
        mockDomainItem,
        mockDomainCategories
      );

      const result = builder.build();
      expect(result).toBeInstanceOf(DeletedItemSingleOutputDto);
      expect(result).toMatchObject({
        id: mockOutput.id,
        name: mockOutput.name,
        quantity: mockOutput.quantity,
        description: mockOutput.description,
      });
      expect(result.createdAt.getTime()).toBeCloseTo(
        mockOutput.createdAt.getTime(),
        -2
      );
      expect(result.updatedAt.getTime()).toBeCloseTo(
        mockOutput.updatedAt.getTime(),
        -2
      );
      expect(result.deletedAt.getTime()).toBeCloseTo(
        mockOutput.deletedAt.getTime(),
        -2
      );
      expect(result.itemCategories.length).toEqual(
        mockOutput.itemCategories.length
      );
      expect(result.itemCategories[0]).toMatchObject({
        id: mockDomainCategories[0].id,
        name: mockDomainCategories[0].name,
        description: mockDomainCategories[0].description,
      });
    });

    it('itemがnullの場合、404エラーを返す', () => {
      const builder = new DeletedItemSingleOutputBuilder(
        null,
        mockDomainCategories
      );
      expect(() => builder.build()).toThrow(
        new HttpException('Items not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});
