import { Test, TestingModule } from '@nestjs/testing';
import { ItemSingleService } from './item.single.service';
import { ItemSingleInputDto } from '../../../application/dto/input/item/item.single.input.dto';
import { ItemSingleOutputDto } from '../../../application/dto/output/item/item.single.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../domain/inventory/items/entities/category.entity';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('ItemSingleService', () => {
  let itemSingleService: ItemSingleService;
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
        ItemSingleService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemById: jest.fn(),
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

    itemSingleService = module.get<ItemSingleService>(ItemSingleService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(itemSingleService).toBeDefined();
  });

  it('登録されている物品を1件取得する', (done) => {
    const itemId: ItemSingleInputDto = {
      itemId: 1,
    };
    const mockItem: Items = {
      id: 1,
      name: 'Item 1',
      quantity: 10,
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
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

    jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
    jest
      .spyOn(categoriesDatasource, 'findCategoriesByItemId')
      .mockReturnValue(of(mockCategories));
    jest
      .spyOn(mockItemDomainFactory, 'fromInfrastructureSingle')
      .mockReturnValue(mockDomainItem);
    jest
      .spyOn(mockCategoryDomainFactory, 'fromInfrastructureList')
      .mockReturnValue(mockDomainCategories);

    itemSingleService.service(itemId).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(ItemSingleOutputDto);
        //各プロパティの値を確認
        expect(result.id).toBe(mockItem.id);
        expect(result.name).toBe(mockItem.name);
        expect(result.quantity).toBe(mockItem.quantity);
        expect(result.description).toBe(mockItem.description);
        expect(result.createdAt).toBe(mockItem.createdAt);
        expect(result.updatedAt).toBe(mockItem.updatedAt);
        //categoriesのプロパティを確認
        expect(result.itemCategories.length).toBe(mockCategories.length);
        expect(result.itemCategories[0].id).toBe(mockCategories[0].id);
        expect(result.itemCategories[0].name).toBe(mockCategories[0].name);
        expect(result.itemCategories[0].description).toBe(
          mockCategories[0].description
        );
        //2番目
        expect(result.itemCategories[1].id).toBe(mockCategories[1].id);
        expect(result.itemCategories[1].name).toBe(mockCategories[1].name);
        expect(result.itemCategories[1].description).toBe(
          mockCategories[1].description
        );
      },
      error: (error) => {
        done(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('指定したIDの物品が存在しない場合、404エラーを返す', (done) => {
    const itemId: ItemSingleInputDto = {
      itemId: 1,
    };
    jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(undefined));
    itemSingleService.service(itemId).subscribe({
      next: () => {
        done.fail('エラーが発生しませんでした');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('指定したIDの物品に対応するカテゴリが存在しない場合、404エラーを返す', (done) => {
    const itemId: ItemSingleInputDto = {
      itemId: 1,
    };
    const mockItem: Items = {
      id: 1,
      name: 'Item 1',
      quantity: 10,
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
    jest
      .spyOn(categoriesDatasource, 'findCategoriesByItemId')
      .mockReturnValue(of(undefined));
    itemSingleService.service(itemId).subscribe({
      next: () => {
        done.fail('エラーが発生しませんでした');
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
