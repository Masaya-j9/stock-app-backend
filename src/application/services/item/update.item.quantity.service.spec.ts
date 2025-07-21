import {
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateItemQuantityService } from './update.item.quantity.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { UpdateItemQuantityInputDto } from '../../dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../dto/output/item/update.item.quantity.output.dto';
import { of, throwError } from 'rxjs';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { ItemQuantityUpdatedEventPublisherInterface } from './events/item.quantity.updated.event.publisher.interface';

describe('UpdateItemQuantityService', () => {
  let updateItemQuantityService: UpdateItemQuantityService;
  let itemsDatasource: ItemsDatasource;
  let mockDataSource: any;
  let mockTransactionManager: any;
  let itemQuantityUpdatedPublisher: ItemQuantityUpdatedEventPublisherInterface;

  beforeEach(async () => {
    // トランザクション用のモックを作成
    mockTransactionManager = {
      transaction: jest.fn((cb) => cb({})),
    };

    mockDataSource = {
      transaction: jest.fn((cb) => cb(mockTransactionManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateItemQuantityService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemById: jest.fn(),
            findCategoryIdsByItemId: jest.fn(),
            updateQuantityById: jest.fn(),
            dataSource: mockDataSource,
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {},
        },
        {
          provide: 'ItemQuantityUpdatedEventPublisherInterface',
          useValue: {
            publishItemQuantityUpdatedEvent: jest.fn(() => of(undefined)),
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

    updateItemQuantityService = module.get<UpdateItemQuantityService>(
      UpdateItemQuantityService
    );
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    itemQuantityUpdatedPublisher =
      module.get<ItemQuantityUpdatedEventPublisherInterface>(
        'ItemQuantityUpdatedEventPublisherInterface'
      );
  });

  it('should be defined', () => {
    expect(updateItemQuantityService).toBeDefined();
  });

  describe('service', () => {
    it('数量を更新する', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = {
        id: 1,
        name: 'Test Item',
        quantity: 5,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      const mockQueryCategoryIds: number[] = [1, 2, 3];
      const mockUpdateResult = {
        quantity: input.quantity,
        updatedAt: new Date(),
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));
      const updateQuantityByIdSpy = jest
        .spyOn(itemsDatasource, 'updateQuantityById')
        .mockReturnValue(of(mockUpdateResult));

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: (result: UpdateItemQuantityOutputDto) => {
          expect(updateQuantityByIdSpy).toHaveBeenCalled();
          expect(result.id).toBe(mockItem.id);
          expect(result.quantity).toBe(input.quantity);
          expect(result.updatedAt).toBeDefined();
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('正常に物品の数量を更新できる', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 20 };
      const mockItem: Items = {
        id: 2,
        name: 'Normal Item',
        quantity: 10,
        description: 'Normal Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [1];
      const mockUpdateResult = {
        quantity: input.quantity,
        updatedAt: new Date(),
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));
      const updateQuantityByIdSpy = jest
        .spyOn(itemsDatasource, 'updateQuantityById')
        .mockReturnValue(of(mockUpdateResult));

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: (result: UpdateItemQuantityOutputDto) => {
          expect(updateQuantityByIdSpy).toHaveBeenCalled();
          expect(result.id).toBe(mockItem.id);
          expect(result.quantity).toBe(input.quantity);
          expect(result.updatedAt).toBeDefined();
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('指定した物品IDが存在しな場合、404エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = null;

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([]));

      updateItemQuantityService.service(input, 1).subscribe({
        next: () => {
          done.fail('Expected an error but got a result');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('指定した物品IDに関連するカテゴリが存在しない場合、404エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = {
        id: 1,
        name: 'Test Item',
        quantity: 5,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };
      const mockQueryCategoryIds: number[] = [];
      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockQueryCategoryIds));

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: () => {
          done.fail('Expected an error but got a result');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Category IDs not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('event publishing', () => {
    it('数量更新後にイベントが発行されることを確認', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = {
        id: 1,
        name: 'Test Item',
        quantity: 5,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      const mockUpdateResult = {
        quantity: input.quantity,
        updatedAt: new Date(),
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1]));
      jest
        .spyOn(itemsDatasource, 'updateQuantityById')
        .mockReturnValue(of(mockUpdateResult));

      const publishSpy = jest.spyOn(
        itemQuantityUpdatedPublisher,
        'publishItemQuantityUpdatedEvent'
      );

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: () => {
          expect(publishSpy).toHaveBeenCalledWith({
            id: mockItem.id,
            quantity: mockUpdateResult.quantity,
            updatedAt: mockUpdateResult.updatedAt,
          });
          done();
        },
        error: (error) => done(error),
      });
    });

    it('イベント発行に失敗した場合、エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = {
        id: 1,
        name: 'Test Item',
        quantity: 5,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      const mockUpdateResult = {
        quantity: input.quantity,
        updatedAt: new Date(),
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1]));
      jest
        .spyOn(itemsDatasource, 'updateQuantityById')
        .mockReturnValue(of(mockUpdateResult));

      // エラーを明示的にInternalServerErrorExceptionとして発行
      jest
        .spyOn(itemQuantityUpdatedPublisher, 'publishItemQuantityUpdatedEvent')
        .mockReturnValue(
          throwError(
            () =>
              new InternalServerErrorException(
                '更新処理中にエラーが発生しました'
              )
          )
        );

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error) => {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('更新処理中にエラーが発生しました');
          done();
        },
        complete: () => done.fail('Expected error but completed successfully'),
      });
    });
  });

  describe('transaction handling', () => {
    it('トランザクションが正しく実行されること', (done) => {
      const input: UpdateItemQuantityInputDto = { quantity: 10 };
      const mockItem: Items = {
        id: 1,
        name: 'Test Item',
        quantity: 5,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1]));
      jest.spyOn(itemsDatasource, 'updateQuantityById').mockReturnValue(
        of({
          quantity: input.quantity,
          updatedAt: new Date(),
        })
      );

      updateItemQuantityService.service(input, mockItem.id).subscribe({
        next: () => {
          expect(mockDataSource.transaction).toHaveBeenCalled();
          expect(itemsDatasource.updateQuantityById).toHaveBeenCalledWith(
            mockItem.id,
            expect.any(Object),
            expect.any(Object)
          );
          done();
        },
        error: done.fail,
      });
    });
  });
});
