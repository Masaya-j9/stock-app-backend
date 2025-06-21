import { Test, TestingModule } from '@nestjs/testing';
import { DeletedItemSingleService } from './deleted.item.single.service';
import { DeletedItemSingleInputDto } from '../../../application/dto/input/item/deleted.item.single.input.dto';
import { DeletedItemSingleOutputDto } from '../../../application/dto/output/item/deleted.item.single.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../domain/inventory/items/entities/category.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('DeletedItemSingleService', () => {
  let deletedItemSingleService: DeletedItemSingleService;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;

  const mockItemDomainFactory = {
    fromInfrastructureSingle: jest.fn(),
  };
  const mockCategoryDomainFactory = {
    fromInfrastructureList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletedItemSingleService,
        {
          provide: ItemsDatasource,
          useValue: {
            findDeletedItemById: jest.fn(),
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findCategoriesByItemId: jest.fn(),
          },
        },
        {
          provide: ItemDomainFactory,
          useValue: mockItemDomainFactory,
        },
        {
          provide: CategoryDomainFactory,
          useValue: mockCategoryDomainFactory,
        },
      ],
    }).compile();

    deletedItemSingleService = module.get<DeletedItemSingleService>(
      DeletedItemSingleService
    );
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(deletedItemSingleService).toBeDefined();
  });

  it('論理削除削除されている物品を1件取得する', (done) => {
    const itemId: DeletedItemSingleInputDto = {
      id: 1,
    };

    const mockItem: Items = {
      id: 1,
      name: 'Item 1',
      quantity: 10,
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      itemCategories: [],
    };

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

    const mockDomainItem: Item = new Item(
      mockItem.id,
      mockItem.name,
      mockItem.quantity,
      mockItem.description,
      mockItem.createdAt,
      mockItem.updatedAt,
      mockItem.deletedAt,
      [1, 2]
    );

    jest
      .spyOn(itemsDatasource, 'findDeletedItemById')
      .mockReturnValue(of(mockItem));
    jest
      .spyOn(categoriesDatasource, 'findCategoriesByItemId')
      .mockReturnValue(of(mockCategories));
    jest
      .spyOn(mockItemDomainFactory, 'fromInfrastructureSingle')
      .mockReturnValue(mockDomainItem);
    jest
      .spyOn(mockCategoryDomainFactory, 'fromInfrastructureList')
      .mockReturnValue(mockDomainCategories);

    deletedItemSingleService.service(itemId).subscribe({
      next: (result: DeletedItemSingleOutputDto) => {
        expect(result).toBeInstanceOf(DeletedItemSingleOutputDto);
        expect(result.id).toBe(mockItem.id);
        expect(result.name).toBe(mockItem.name);
        expect(result.quantity).toBe(mockItem.quantity);
        expect(result.description).toBe(mockItem.description);
        expect(result.createdAt).toBe(mockItem.createdAt);
        expect(result.updatedAt).toBe(mockItem.updatedAt);
        expect(result.deletedAt).toBe(mockItem.deletedAt);
        expect(result.itemCategories).toEqual(
          mockDomainCategories.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          }))
        );
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Item with id ${itemId.id} not found`);
      },
      complete: () => {
        done();
      },
    });
  });

  it('論理削除されている物品が存在しない場合、404エラーを返す', (done) => {
    const itemId: DeletedItemSingleInputDto = {
      id: 1,
    };
    jest
      .spyOn(itemsDatasource, 'findDeletedItemById')
      .mockReturnValue(of(undefined));

    deletedItemSingleService.service(itemId).subscribe({
      next: () => {
        done.fail('Expected an error, but got a result');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Item not found`);
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリーが存在しない場合、404エラーを返す', (done) => {
    const itemId: DeletedItemSingleInputDto = {
      id: 1,
    };
    const mockItem: Items = {
      id: 1,
      name: 'Item 1',
      quantity: 10,
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      itemCategories: [],
    };
    jest
      .spyOn(itemsDatasource, 'findDeletedItemById')
      .mockReturnValue(of(mockItem));
    jest
      .spyOn(categoriesDatasource, 'findCategoriesByItemId')
      .mockReturnValue(of(undefined));

    deletedItemSingleService.service(itemId).subscribe({
      next: () => {
        done.fail('Expected an error, but got a result');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Categories not found');
        done();
      },
      complete: () => {
        done();
      },
    });
  });
});
