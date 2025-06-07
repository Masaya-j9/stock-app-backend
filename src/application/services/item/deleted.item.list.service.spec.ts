import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DeletedItemListService } from './deleted.item.list.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { DeletedItemListInputDto } from '../../dto/input/item/deleted.item.list.input.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { NotFoundException } from '@nestjs/common';
import { DeletedItemListOutputDto } from '../../dto/output/item/deleted.item.list.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Category } from '../../../domain/inventory/items/entities/category.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';

describe('DeletedItemListService', () => {
  let deletedItemListService: DeletedItemListService;
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
        DeletedItemListService,
        {
          provide: ItemsDatasource,
          useValue: {
            findDeletedItemList: jest.fn(),
            countDeletedAll: jest.fn(),
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

    deletedItemListService = module.get<DeletedItemListService>(
      DeletedItemListService
    );
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(deletedItemListService).toBeDefined();
  });

  describe('service', () => {
    it('論理削除されている物品一覧を取得する', (done) => {
      const input: DeletedItemListInputDto = {
        pages: 1,
        sortOrder: 0,
      };
      const mockDeletedItems: Items[] = [
        {
          id: 1,
          name: 'Deleted Item 1',
          quantity: 10,
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
          itemCategories: [],
        },
        {
          id: 2,
          name: 'Deleted Item 2',
          quantity: 5,
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
          itemCategories: [],
        },
      ];
      const mockCategories: Categories[] = [
        {
          id: 1,
          name: 'Category 1',
          description: 'categoryDescription',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
        {
          id: 2,
          name: 'Category 2',
          description: 'categoryDescription',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];
      const mockCategoryIdsAndItemIds = [
        { itemId: 1, categoryId: 1 },
        { itemId: 2, categoryId: 2 },
      ];

      const mockTotalItemCount: number = 2;
      const mockTotalPages: number = 1;

      const mockDomainDeletedItems: Item[] = [
        new Item(
          1,
          'Deleted Item 1',
          10,
          'Description 1',
          new Date(),
          new Date(),
          new Date(),
          [1]
        ),
        new Item(
          2,
          'Deleted Item 2',
          5,
          'Description 2',
          new Date(),
          new Date(),
          new Date(),
          [2]
        ),
      ];

      const mockDomainCategories: Category[] = [
        new Category(
          1,
          'Category 1',
          'categoryDescription',
          new Date(),
          new Date(),
          null
        ),
        new Category(
          2,
          'Category 2',
          'categoryDescription',
          new Date(),
          new Date(),
          null
        ),
      ];

      jest
        .spyOn(itemsDatasource, 'findDeletedItemList')
        .mockReturnValue(of(mockDeletedItems));
      jest
        .spyOn(categoriesDatasource, 'findByCategories')
        .mockReturnValue(of(mockCategories));
      jest
        .spyOn(categoriesDatasource, 'findCategoryIdsAndItemIds')
        .mockReturnValue(of(mockCategoryIdsAndItemIds));
      jest
        .spyOn(itemsDatasource, 'countDeletedAll')
        .mockReturnValue(of(mockTotalItemCount));
      mockItemDomainFactory.fromInfrastructure.mockImplementation(
        (item: Items) => {
          return mockDomainDeletedItems.find(
            (domainItem) => domainItem.id === item.id
          );
        }
      );
      mockCategoryDomainFactory.fromInfrastructure.mockImplementation(
        (category: Categories) => {
          return mockDomainCategories.find(
            (domainCategory) => domainCategory.id === category.id
          );
        }
      );

      deletedItemListService.service(input).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(DeletedItemListOutputDto);
          expect(result.count).toBe(mockTotalItemCount);
          expect(result.totalPages).toBe(mockTotalPages);
          expect(result.results.length).toBe(mockDeletedItems.length);

          result.results.forEach((item, index) => {
            expect(item.id).toBe(mockDomainDeletedItems[index].id);
            expect(item.name).toBe(mockDomainDeletedItems[index].name);
            expect(item.quantity).toBe(mockDomainDeletedItems[index].quantity);
            expect(item.description).toBe(
              mockDomainDeletedItems[index].description
            );
            expect(item.itemsCategories.length).toBe(1);

            const expectedCategory = mockDomainCategories.find(
              (cat) => cat.id === item.itemsCategories[0].id
            );
            expect(expectedCategory).toBeDefined();
            expect(item.itemsCategories[0].id).toBe(expectedCategory.id);
            expect(item.itemsCategories[0].name).toBe(expectedCategory.name);
            expect(item.itemsCategories[0].description).toBe(
              expectedCategory.description
            );
          });
        },
        error: (err) => {
          done.fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('論理削除されている物品が存在しない場合、404エラーをスローする', (done) => {
      const mockDeletedItems: Items[] = [];
      const mockCategories: Categories[] = [];
      const mockCategoryIdsAndItemIds = [];

      const mockTotalItemCount: number = 0;

      jest
        .spyOn(itemsDatasource, 'findDeletedItemList')
        .mockReturnValue(of(mockDeletedItems));
      jest
        .spyOn(categoriesDatasource, 'findByCategories')
        .mockReturnValue(of(mockCategories));
      jest
        .spyOn(categoriesDatasource, 'findCategoryIdsAndItemIds')
        .mockReturnValue(of(mockCategoryIdsAndItemIds));
      jest
        .spyOn(itemsDatasource, 'countDeletedAll')
        .mockReturnValue(of(mockTotalItemCount));
      mockItemDomainFactory.fromInfrastructure.mockImplementation(() => {
        return null;
      });
      mockCategoryDomainFactory.fromInfrastructure.mockImplementation(() => {
        return null;
      });

      deletedItemListService.service({ pages: 1, sortOrder: 0 }).subscribe({
        next: () => {
          done.fail('Expected an error, but got a result');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe('Items not found');
          done();
        },
        complete: () => {
          done.fail('Expected an error, but completed successfully');
        },
      });
    });
  });
});
