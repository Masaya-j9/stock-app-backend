import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ItemListService } from './item.list.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { ItemAndCategoryType } from '../../../infrastructure/types/item.and.category.type';
import { NotFoundException } from '@nestjs/common';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../domain/inventory/items/entities/category.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';

describe('ItemListService', () => {
  let itemListService: ItemListService;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;

  const mockItemDomainFactory = {
    fromInfrastructure: jest.fn(),
  };
  const mockCategoryDomainFactory = {
    fromInfrastructure: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemListService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemList: jest.fn(),
            getTotalCount: jest.fn(),
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategories: jest.fn(),
            findCategoryIdsAndItemIds: jest.fn(),
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

    itemListService = module.get<ItemListService>(ItemListService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(itemListService).toBeDefined();
  });

  it('登録されている物品の一覧を取得する', (done) => {
    const input: ItemListInputDto = {
      pages: 1,
      sortOrder: 0,
    };
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
    const mockDomainItems: Item[] = [
      new Item(1, 'Item 1', 10, 'Description 1', new Date(), new Date(), null, [
        1,
      ]),
      new Item(2, 'Item 2', 5, 'Description 2', new Date(), new Date(), null, [
        2,
      ]),
    ];
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
    const mockTotalCount: number = 2;

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

    jest.spyOn(itemsDatasource, 'findItemList').mockReturnValue(of(mockItems));
    jest
      .spyOn(itemsDatasource, 'getTotalCount')
      .mockReturnValue(of(mockTotalCount));
    jest
      .spyOn(categoriesDatasource, 'findByCategories')
      .mockReturnValue(of(mockCategories));
    jest
      .spyOn(categoriesDatasource, 'findCategoryIdsAndItemIds')
      .mockReturnValue(of(mockItemAndCategoryIds));
    jest
      .spyOn(mockItemDomainFactory, 'fromInfrastructure')
      .mockImplementation((item) => {
        if (item.id === 1) return mockDomainItems[0];
        return mockDomainItems[1];
      });
    jest
      .spyOn(mockCategoryDomainFactory, 'fromInfrastructure')
      .mockImplementation((category) => {
        if (category.id === 1) return mockDomainCategories[0];
        return mockDomainCategories[1];
      });

    itemListService.service(input).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(ItemListOutputDto);
        expect(result.count).toBe(mockTotalCount);
        expect(result.results.length).toBe(2);
        expect(result.results[0].id).toBe(mockItems[0].id);
      },
      error: (error) => {
        done.fail(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('取得する物品情報が0件の場合、404を返す', (done) => {
    const input: ItemListInputDto = {
      pages: 1,
      sortOrder: 0,
    };
    jest.spyOn(itemsDatasource, 'findItemList').mockReturnValue(of([])); // 空の配列を返す
    jest.spyOn(itemsDatasource, 'getTotalCount').mockReturnValue(of(0)); // 合計数を0に設定
    itemListService.service(input).subscribe({
      next: () => {
        done.fail('エラーが発生しませんでした');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Items not found');
        done();
      },
      complete: () => {
        done.fail('エラーが発生しませんでした');
      },
    });
  });
});
