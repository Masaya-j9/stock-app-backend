import { Test, TestingModule } from '@nestjs/testing';
import { ItemRegisterService } from './item.register.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemRegisterInputDto } from '../../dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from '../../dto/output/item/item.register.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { Transaction } from 'typeorm';
import { ItemCreatedEventPublisherInterface } from './events/item.created.event.publisher.interface';

describe('ItemRegisterService', () => {
  let itemRegisterService: ItemRegisterService;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;
  let itemCreatedPublisher: ItemCreatedEventPublisherInterface;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemRegisterService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemByName: jest.fn(),
            createItemWithinTransaction: jest.fn(),
            createItemCategoryWithinTransaction: jest.fn(),
            dataSource: {
              manager: {
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
          provide: 'ItemCreatedEventPublisherInterface',
          useValue: {
            publishItemCreatedEvent: jest.fn(),
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

    itemRegisterService = module.get<ItemRegisterService>(ItemRegisterService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
    itemCreatedPublisher = module.get<ItemCreatedEventPublisherInterface>(
      'ItemCreatedEventPublisherInterface'
    );
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(itemRegisterService).toBeDefined();
  });

  describe('service', () => {
    it('物品を登録する', (done) => {
      const input: ItemRegisterInputDto = {
        name: 'Item 1',
        quantity: 10,
        description: 'Item 1',
        categoryIds: [1, 2],
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
      const isUniqueItem = undefined;

      const mockItem = {
        id: 1,
        name: input.name,
        quantity: input.quantity,
        description: input.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        TransactionalEntityManager: {} as Transaction,
      };

      jest
        .spyOn(itemsDatasource, 'findItemByName')
        .mockReturnValue(of(isUniqueItem));
      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of(mockCategories));
      jest
        .spyOn(itemsDatasource, 'createItemWithinTransaction')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'createItemCategoryWithinTransaction')
        .mockReturnValue(of({ ids: [1, 2] }));
      jest
        .spyOn(itemCreatedPublisher, 'publishItemCreatedEvent')
        .mockReturnValue(of(void 0));
      const logSpy = jest.spyOn(logger, 'log');
      logSpy.mockImplementation(() => {});
      logSpy.mockClear();

      itemRegisterService.service(input).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ItemRegisterOutputDto);
          expect(result.id).toBe(1);
          expect(result.name).toBe('Item 1');
          expect(result.quantity).toBe(10);
          expect(result.description).toBe('Item 1');
          expect(result.itemsCategories[0].id).toBe(1);
          expect(result.itemsCategories[1].id).toBe(2);

          expect(
            itemCreatedPublisher.publishItemCreatedEvent
          ).toHaveBeenCalledWith({
            id: mockItem.id,
            name: mockItem.name,
            quantity: mockItem.quantity,
            description: mockItem.description,
            createdAt: mockItem.createdAt,
            updatedAt: mockItem.updatedAt,
            categoryIds: input.categoryIds,
          });

          expect(logSpy).toHaveBeenCalledWith(
            `Item registered & event published! ID: ${mockItem.id}`
          );
        },
        error: (error) => {
          fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名が重複している場合は、409エラーを返す', (done) => {
      const input: ItemRegisterInputDto = {
        name: 'Item 1',
        quantity: 10,
        description: 'Item 1',
        categoryIds: [1, 2],
      };
      //ここのテストは、物品名が重複している場合のテストです。
      const existingItem: Items = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'Item 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      jest
        .spyOn(itemsDatasource, 'findItemByName')
        .mockReturnValue(of(existingItem));
      itemRegisterService.service(input).subscribe({
        next: () => {
          fail('Expected error, but got success');
        },
        error: (error) => {
          expect(error.response.statusCode).toBe(409);
          expect(error.response.message).toBe('This value is not unique');
          expect(error.response.error).toBe('Conflict');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリが存在しない場合は、404エラーを返す', (done) => {
      const input: ItemRegisterInputDto = {
        name: 'Item 1',
        quantity: 10,
        description: 'Item 1',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemsDatasource, 'findItemByName')
        .mockReturnValue(of(undefined));
      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of([]));

      itemRegisterService.service(input).subscribe({
        next: () => {
          fail('Expected error, but got success');
        },
        error: (error) => {
          expect(error.response.statusCode).toBe(404);
          expect(error.response.message).toBe(
            '指定されたカテゴリはすべて存在しません'
          );
          expect(error.response.error).toBe('Not Found');
          done();
        },
        complete: () => {
          fail('Expected error, but got complete');
        },
      });
    });
  });

  describe('checkItemNameConflict', () => {
    it('物品名が重複していない場合は、trueを返す', (done) => {
      const name = 'Item 1';
      const existingItem: Items = undefined;

      jest
        .spyOn(itemsDatasource, 'findItemByName')
        .mockReturnValue(of(existingItem));

      itemRegisterService.checkItemNameConflict(name).subscribe({
        next: (result) => {
          expect(result).toBe(true);
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名が重複している場合は、409エラーを返す', (done) => {
      const name = 'Item 1';
      const existingItem: Items = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'Item 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest
        .spyOn(itemsDatasource, 'findItemByName')
        .mockReturnValue(of(existingItem));

      itemRegisterService.checkItemNameConflict(name).subscribe({
        next: () => {
          done.fail('Expected error, but got success');
        },
        error: (error) => {
          expect(error.response.statusCode).toBe(409);
          expect(error.response.message).toBe('This value is not unique');
          expect(error.response.error).toBe('Conflict');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('checkCategoriesExist', () => {
    it('カテゴリがすべて存在する場合は、カテゴリのリストを返す', (done) => {
      const categoryIds = [1, 2];
      const mockCategories: Categories[] = [
        {
          id: 1,
          name: 'カテゴリ',
          description: 'カテゴリ説明',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
        {
          id: 2,
          name: 'カテゴリ',
          description: 'カテゴリ説明',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];

      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of(mockCategories));

      (itemRegisterService as any).checkCategoriesExist(categoryIds).subscribe({
        next: (result) => {
          expect(result).toHaveLength(2);
          expect(result[0].id).toBe(1);
          expect(result[1].id).toBe(2);
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリがすべて存在しない場合は、404エラーを返す', (done) => {
      const categoryIds = [1, 2];
      const mockCategories: Categories[] = [
        {
          id: 1,
          name: 'カテゴリ',
          description: 'カテゴリ説明',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];

      jest
        .spyOn(categoriesDatasource, 'findByCategoryIds')
        .mockReturnValue(of(mockCategories));

      (itemRegisterService as any).checkCategoriesExist(categoryIds).subscribe({
        next: () => {
          done.fail('Expected error, but got success');
        },
        error: (error) => {
          expect(error.response.statusCode).toBe(404);
          expect(error.response.message).toBe(
            '指定されたカテゴリはすべて存在しません'
          );
          expect(error.response.error).toBe('Not Found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('registerItemWithinTransaction', () => {
    it('物品をトランザクション内で登録する', (done) => {
      const id = 1;
      const name = 'Test Item';
      const quantity = 1;
      const description = 'Test Description';
      const categoryIds = [1, 2];
      const categories: Categories[] = [
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
      const transactionalEntityManager = {};

      const mockItem = {
        id,
        name,
        quantity,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest
        .spyOn(itemsDatasource, 'createItemWithinTransaction')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'createItemCategoryWithinTransaction')
        .mockReturnValue(of({ ids: [1, 2] }));
      jest
        .spyOn(itemCreatedPublisher, 'publishItemCreatedEvent')
        .mockReturnValue(of(void 0));
      const logSpy = jest.spyOn(logger, 'log');
      logSpy.mockClear();

      jest
        .spyOn(itemsDatasource, 'createItemWithinTransaction')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'createItemCategoryWithinTransaction')
        .mockReturnValue(of({ ids: [1, 2] }));
      jest
        .spyOn(itemCreatedPublisher, 'publishItemCreatedEvent')
        .mockReturnValue(of(void 0));

      (itemRegisterService as any)
        .registerItemWithinTransaction(
          name,
          quantity,
          description,
          categoryIds,
          categories,
          transactionalEntityManager
        )
        .subscribe({
          next: (result) => {
            expect(result).toBeInstanceOf(ItemRegisterOutputDto);
            expect(result.name).toBe(name);
            expect(result.quantity).toBe(quantity);
            expect(result.description).toBe(description);
            expect(result.itemsCategories).toHaveLength(2);

            expect(
              itemCreatedPublisher.publishItemCreatedEvent
            ).toHaveBeenCalledTimes(1);
            expect(logSpy).toHaveBeenCalledWith(
              'Item registered & event published! ID: 1'
            );
          },
          error: (error) => {
            fail(error);
          },
          complete: () => {
            done();
          },
        });
    });

    it('トランザクション処理が失敗した場合、500エラーを返す', (done) => {
      const name = 'Test Item';
      const quantity = 1;
      const description = 'Test Description';
      const categoryIds = [1, 2];
      const categories: Categories[] = [
        {
          id: 1,
          name: 'Category 1',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        },
      ];
      const transactionalEntityManager = {};

      jest
        .spyOn(itemsDatasource, 'createItemWithinTransaction')
        .mockReturnValue(of(undefined));
      jest.spyOn(logger, 'error').mockImplementation(jest.fn());

      (itemRegisterService as any)
        .registerItemWithinTransaction(
          name,
          quantity,
          description,
          categoryIds,
          categories,
          transactionalEntityManager
        )
        .subscribe({
          next: () => {
            done.fail('Expected error, but got success');
          },
          error: (error) => {
            expect(error.response.statusCode).toBe(500);
            expect(error.response.message).toBe(
              '登録処理中にエラーが発生しました'
            );
            expect(error.response.error).toBe('Internal Server Error');
            logger.error('Error during item registration:', error);
            expect(logger.error).toHaveBeenCalledWith(
              'Error during item registration:',
              error
            );
            done();
          },
          complete: () => {
            done.fail('Expected error, but got complete');
          },
        });
    });
  });
});
