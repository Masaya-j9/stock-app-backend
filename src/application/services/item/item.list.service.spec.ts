import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ItemListService } from './item.list.service';
import { ItemListDatasource } from '../../../infrastructure/datasources/items/item.list.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { ItemAndCategoryType } from '../../../infrastructure/types/item.and.category.type';
import { NotFoundException } from '@nestjs/common';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';

describe('ItemListService', () => {
  let itemListService: ItemListService;
  let itemListDatasource: ItemListDatasource;
  let categoriesDatasource: CategoriesDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemListService,
        {
          provide: ItemListDatasource,
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
      ],
    }).compile();

    itemListService = module.get<ItemListService>(ItemListService);
    itemListDatasource = module.get<ItemListDatasource>(ItemListDatasource);
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

    jest
      .spyOn(itemListDatasource, 'findItemList')
      .mockReturnValue(of(mockItems));
    jest
      .spyOn(itemListDatasource, 'getTotalCount')
      .mockReturnValue(of(mockTotalCount));
    jest
      .spyOn(categoriesDatasource, 'findByCategories')
      .mockReturnValue(of(mockCategories));
    jest
      .spyOn(categoriesDatasource, 'findCategoryIdsAndItemIds')
      .mockReturnValue(of(mockItemAndCategoryIds));

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
    jest.spyOn(itemListDatasource, 'findItemList').mockReturnValue(of([])); // 空の配列を返す
    jest.spyOn(itemListDatasource, 'getTotalCount').mockReturnValue(of(0)); // 合計数を0に設定
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
