import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ItemDeleteService } from './item.delete.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemDeleteInputDto } from '../../dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../dto/output/item/item.delete.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { of, throwError } from 'rxjs';
import { ItemDeletedEventPublisherInterface } from './events/item.deleted.event.publisher.interface';

describe('ItemDeleteService', () => {
  let itemDeleteService: ItemDeleteService;
  let itemsDatasource: ItemsDatasource;
  let logger: Logger;
  let itemDeletedPublisher: ItemDeletedEventPublisherInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemDeleteService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemById: jest.fn(),
            findCategoryIdsByItemId: jest.fn(),
            deletedById: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: 'ItemDeletedEventPublisherInterface',
          useValue: {
            publishItemDeletedEvent: jest.fn(() => of(undefined)),
          },
        },
      ],
    }).compile();

    itemDeleteService = module.get<ItemDeleteService>(ItemDeleteService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    logger = module.get<Logger>(Logger);
    itemDeletedPublisher = module.get<ItemDeletedEventPublisherInterface>(
      'ItemDeletedEventPublisherInterface'
    );
  });

  it('should be defined', () => {
    expect(itemDeleteService).toBeDefined();
  });

  describe('service', () => {
    it('物品を論理削除すること', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };
      const categoryIds = [1, 2];
      const now = new Date();

      const mockItem: Items = {
        id: input.itemId,
        name: 'Item Name',
        quantity: 10,
        description: 'Item Description',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        itemCategories: [],
      };

      const itemDeleteOutputResult: ItemDeleteOutputDto = {
        id: input.itemId,
        name: 'Item Name',
        quantity: 10,
        description: 'Item Description',
        updatedAt: now,
        deletedAt: now,
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(categoryIds));
      jest.spyOn(itemsDatasource, 'deletedById').mockReturnValue(of(undefined));
      jest.spyOn(logger, 'log').mockImplementation(jest.fn());

      itemDeleteService.service(input).subscribe({
        next: (result) => {
          logger.log(`Deleted item with ID: ${input.itemId}`);
          expect(result).toBeInstanceOf(ItemDeleteOutputDto);
          expect(result.id).toBe(itemDeleteOutputResult.id);
          expect(result.name).toBe(itemDeleteOutputResult.name);
          expect(result.quantity).toBe(itemDeleteOutputResult.quantity);
          expect(result.description).toBe(itemDeleteOutputResult.description);
          expect(result.updatedAt).toBeInstanceOf(Date);
          expect(result.deletedAt).toBeInstanceOf(Date);
          done();
        },
        error: (err) => {
          fail(err);
        },
      });
    });

    it('削除する物品IDが存在しないとき、404エラーを返すこと', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };
      const categoryIds = [1, 2];

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(undefined));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(categoryIds));

      itemDeleteService.service(input).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(`Item with ID ${input.itemId} not found`);
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('削除する物品IDに関連するカテゴリーが存在しないとき、404エラーを返すこと', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };

      jest
        .spyOn(itemsDatasource, 'findItemById')
        .mockReturnValue(of(undefined));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(undefined));

      itemDeleteService.service(input).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(`Item with ID ${input.itemId} not found`);
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDがすでに論理削除されている場合は、409エラーを返すこと', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };
      const categoryIds = [1, 2];
      const now = new Date();
      const mockItem: Items = {
        id: input.itemId,
        name: 'Item Name',
        quantity: 10,
        description: 'Item Description',
        createdAt: now,
        updatedAt: now,
        deletedAt: now,
        itemCategories: [],
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(categoryIds));

      itemDeleteService.service(input).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.message).toBe(
            `Item with ID ${input.itemId} is already deleted`
          );
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品削除後にイベントが発行されることを確認', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };
      const mockItem: Items = {
        id: 1,
        name: 'Item Name',
        quantity: 10,
        description: 'Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1]));
      jest.spyOn(itemsDatasource, 'deletedById').mockReturnValue(of(undefined));
      const publishSpy = jest.spyOn(
        itemDeletedPublisher,
        'publishItemDeletedEvent'
      );

      itemDeleteService.service(input).subscribe({
        next: () => {
          expect(publishSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              id: mockItem.id,
              name: mockItem.name,
              quantity: mockItem.quantity,
              categoryIds: [1],
            })
          );
          done();
        },
        error: done,
      });
    });

    it('イベント発行に失敗した場合、エラーを返す', (done) => {
      const input: ItemDeleteInputDto = { itemId: 1 };
      const mockItem: Items = {
        id: 1,
        name: 'Item Name',
        quantity: 10,
        description: 'Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemCategories: [],
      };

      jest.spyOn(itemsDatasource, 'findItemById').mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1]));
      jest.spyOn(itemsDatasource, 'deletedById').mockReturnValue(of(undefined));
      jest
        .spyOn(itemDeletedPublisher, 'publishItemDeletedEvent')
        .mockReturnValue(
          throwError(() => new Error('Failed to publish event'))
        );

      itemDeleteService.service(input).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    });
  });
});
