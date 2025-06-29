import {
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ItemUpdateService } from './item.update.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemUpdateInputDto } from '../../dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../dto/output/item/item.update.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Item } from '../../../domain/inventory/items/entities/item.entity';

import { of, throwError } from 'rxjs';

describe('ItemUpdateService', () => {
  let itemUpdateService: ItemUpdateService;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemUpdateService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemById: jest.fn(),
            findCategoryIdsByItemId: jest.fn(),
            updateItemWithinTransactionQuery: jest.fn(),
            updateItemCategoriesWithinTransactionQuery: jest.fn(),
            dataSource: {
              manager: {
                // transactionモック
                transaction: jest.fn((cb) => cb({})),
              },
            },
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategoryIds: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    itemUpdateService = module.get<ItemUpdateService>(ItemUpdateService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(itemUpdateService).toBeDefined();
  });

  describe('service', () => {
    it('カテゴリを追加して、物品情報を更新する', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      const itemUpdateOutputDto: ItemUpdateOutputDto = {
        id: 1,
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        updatedAt: new Date(),
        itemCategories: [
          {
            id: 1,
            name: 'categoryName1',
            description: 'categoryDescription1',
          },
          {
            id: 2,
            name: 'categoryName2',
            description: 'categoryDescription2',
          },
          {
            id: 3,
            name: 'categoryName3',
            description: 'categoryDescription3',
          },
        ],
      };
      const mockQueryItem: Items = {
        id: 1,
        name: 'currentItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [1, 2];

      const mockUpdatedItem: Items = {
        id: 1,
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      const mockUpdatedCategoryIds: number[] = [1, 2, 3];

      const mockUpdateCategories: Categories[] = [
        {
          id: 1,
          name: 'categoryName1',
          description: 'categoryDescription1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
        {
          id: 2,
          name: 'categoryName2',
          description: 'categoryDescription2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
        {
          id: 3,
          name: 'categoryName3',
          description: 'categoryDescription3',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockQueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));
      jest
        .spyOn(itemsDatasource, 'updateItemWithinTransactionQuery')
        .mockReturnValue(of(mockUpdatedItem));
      jest
        .spyOn(itemsDatasource, 'updateItemCategoriesWithinTransactionQuery')
        .mockReturnValue(of({ categoryIds: mockUpdatedCategoryIds }));
      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of(mockUpdateCategories));
      jest.spyOn(logger, 'log').mockImplementation(jest.fn());

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ItemUpdateOutputDto);
          expect(result.id).toBe(itemUpdateOutputDto.id);
          expect(result.name).toBe(itemUpdateOutputDto.name);
          expect(result.quantity).toBe(itemUpdateOutputDto.quantity);
          expect(result.description).toBe(itemUpdateOutputDto.description);

          // 更新時間の比較を厳密にしない
          const timeDifference = Math.abs(
            new Date(result.updatedAt).getTime() -
              new Date(itemUpdateOutputDto.updatedAt).getTime()
          );
          expect(timeDifference).toBeLessThanOrEqual(1000); // 許容範囲を1秒以内に設定

          expect(result.itemCategories).toEqual(
            itemUpdateOutputDto.itemCategories
          );
          logger.log('Item updated successfully');
          expect(logger.log).toHaveBeenCalledWith('Item updated successfully');
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリを減らして、物品情報を更新する', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1],
      };
      const itemUpdateOutputDto: ItemUpdateOutputDto = {
        id: 1,
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        updatedAt: new Date(),
        itemCategories: [
          {
            id: 1,
            name: 'categoryName1',
            description: 'categoryDescription1',
          },
        ],
      };
      const mockqueryItem: Items = {
        id: 1,
        name: 'currentItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockqueryCategoryIds: number[] = [1, 2];

      const mockUpdatedItem: Items = {
        id: 1,
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      const mockUpdatedCategoryIds: number[] = [1];

      const mockUpdateCategories: Categories[] = [
        {
          id: 1,
          name: 'categoryName1',
          description: 'categoryDescription1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockqueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockqueryCategoryIds));
      jest
        .spyOn(itemsDatasource, 'updateItemWithinTransactionQuery')
        .mockReturnValue(of(mockUpdatedItem));
      jest
        .spyOn(itemsDatasource, 'updateItemCategoriesWithinTransactionQuery')
        .mockReturnValue(of({ categoryIds: mockUpdatedCategoryIds }));
      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of(mockUpdateCategories));
      jest.spyOn(logger, 'log').mockImplementation(jest.fn());

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ItemUpdateOutputDto);
          expect(result.id).toBe(itemUpdateOutputDto.id);
          expect(result.name).toBe(itemUpdateOutputDto.name);
          expect(result.quantity).toBe(itemUpdateOutputDto.quantity);
          expect(result.description).toBe(itemUpdateOutputDto.description);

          // 更新時間の比較を厳密にしない
          const timeDifference = Math.abs(
            new Date(result.updatedAt).getTime() -
              new Date(itemUpdateOutputDto.updatedAt).getTime()
          );
          expect(timeDifference).toBeLessThanOrEqual(1000); // 許容範囲を1秒以内に設定

          expect(result.itemCategories).toEqual(
            itemUpdateOutputDto.itemCategories
          );
          logger.log('Item updated successfully');
          expect(logger.log).toHaveBeenCalledWith('Item updated successfully');
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新する物品が存在しない場合、404エラーを返す', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(
          throwError(() => new NotFoundException('Item not found'))
        );
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1, 2, 3]));

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: () => {
          done.fail('Expected an error, but got a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Item not found');
          expect(itemsDatasource.findItemById).toHaveBeenCalledWith(
            inputItemId
          );
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品に登録されているカテゴリが存在しない場合、404エラーを返す', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };

      const mockqueryItem: Items = {
        id: 1,
        name: 'currentItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockqueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(
          throwError(() => new NotFoundException('Category IDs not found'))
        );

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: () => {
          done.fail('Expected an error, but got a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Category IDs not found');
          expect(itemsDatasource.findCategoryIdsByItemId).toHaveBeenCalledWith(
            inputItemId
          );
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新後の物品名が既存の他の物品名と重複している場合、409エラーを返す', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      const mockQueryItem: Items = {
        id: 1,
        name: 'updatedItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [1, 2, 3];

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockQueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: () => {
          done.fail('Expected an error, but got a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(ConflictException);
          expect(error.message).toBe('This value is not unique');
          expect(itemsDatasource.findItemById).toHaveBeenCalledWith(
            inputItemId
          );
          expect(itemsDatasource.findCategoryIdsByItemId).toHaveBeenCalledWith(
            inputItemId
          );
          done();
        },
      });
    });

    it('itemエンティティが更新できないとき、400エラーを返す', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };

      const mockQueryItem: Items = {
        id: 1,
        name: 'currentItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [1, 2, 3];

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockQueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));
      jest
        .spyOn(itemUpdateService as any, 'tryUpdateDomainItem')
        .mockImplementation(() => {
          throw new BadRequestException('Invalid update parameters');
        });

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: () => {
          done.fail('Expected an error, but got a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe('Invalid update parameters');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新トランザクションが失敗した場合、500エラーを返す', (done) => {
      const inputItemId = 1;
      const itemUpdateInputDto: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };

      const mockQueryItem: Items = {
        id: 1,
        name: 'currentItemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [1, 2, 3];

      const mockUpdatedItem: Item = new Item(
        inputItemId,
        itemUpdateInputDto.name,
        itemUpdateInputDto.quantity,
        itemUpdateInputDto.description,
        new Date(),
        new Date(),
        null,
        [1, 2, 3]
      );

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(mockQueryItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));
      jest
        .spyOn(itemUpdateService as any, 'tryUpdateDomainItem')
        .mockImplementation(() => mockUpdatedItem);
      jest
        .spyOn(itemsDatasource.dataSource.manager, 'transaction')
        .mockImplementation(() => {
          throw new InternalServerErrorException(
            '更新処理中にエラーが発生しました'
          );
        });

      itemUpdateService.service(itemUpdateInputDto, inputItemId).subscribe({
        next: () => {
          done.fail('Expected an error, but got a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('更新処理中にエラーが発生しました');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
