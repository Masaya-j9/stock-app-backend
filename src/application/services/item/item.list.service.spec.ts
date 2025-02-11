import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ItemListService } from './item.list.service';
import { ItemListDatasource } from '../../../infrastructure/datasources/items/item.list.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { NotFoundException } from '@nestjs/common';

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
    const items: Items[] = [
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
    const totalCount = 2;
    const categories: Categories[] = [
      {
        id: 1,
        name: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemId: 1,
        description: 'その他のカテゴリ',
        itemCategories: [],
      },
      {
        id: 2,
        name: 'Category 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemId: 2,
        description: 'その他のカテゴリ',
        itemCategories: [],
      },
    ];

    jest.spyOn(itemListDatasource, 'findItemList').mockReturnValue(of(items));
    jest
      .spyOn(itemListDatasource, 'getTotalCount')
      .mockReturnValue(of(totalCount));
    jest
      .spyOn(categoriesDatasource, 'findByCategories')
      .mockReturnValue(of(categories));

    itemListService.service(input).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(ItemListOutputDto);
        expect(result.results).toHaveLength(2);
        expect(result.count).toBe(2);

        const firstItem = result.results[0];
        expect(firstItem.id).toBe(1);
        expect(firstItem.name).toBe('Item 1');
        expect(firstItem.quantity).toBe(10);
        expect(firstItem.description).toBe('Description 1');
        expect(firstItem.itemsCategories).toBeDefined();
        expect(firstItem.itemsCategories).toHaveLength(1);

        const secondItem = result.results[1];
        expect(secondItem.id).toBe(2);
        expect(secondItem.name).toBe('Item 2');
        expect(secondItem.quantity).toBe(5);
        expect(secondItem.description).toBe('Description 2');
        expect(secondItem.itemsCategories).toBeDefined();
        expect(secondItem.itemsCategories).toHaveLength(1);

        const firstItemCategories = firstItem.itemsCategories;
        expect(firstItemCategories).toHaveLength(1);
        expect(firstItemCategories[0].id).toBe(1); // ここで categories[0] にアクセス
        expect(firstItemCategories[0].name).toBe('Category 1');
        expect(firstItemCategories[0].itemId).toBe(1);
        expect(firstItemCategories[0].description).toBe('その他のカテゴリ');
        expect(firstItemCategories[0].createdAt).toBeDefined();
        expect(firstItemCategories[0].updatedAt).toBeDefined();

        const secondItemCategories = secondItem.itemsCategories;
        expect(secondItemCategories).toHaveLength(1); // secondItemのitemsCategoriesも1つの要素
        expect(secondItemCategories[0].id).toBe(2); // ここで categories[1] にアクセス
        expect(secondItemCategories[0].name).toBe('Category 2');
        expect(secondItemCategories[0].itemId).toBe(2);
        expect(secondItemCategories[0].description).toBe('その他のカテゴリ');
        expect(secondItemCategories[0].createdAt).toBeDefined();
        expect(secondItemCategories[0].updatedAt).toBeDefined();
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
