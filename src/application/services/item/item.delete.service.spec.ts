import { Test, TestingModule } from '@nestjs/testing';
import { ItemDeleteService } from './item.delete.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemDeleteInputDto } from '../../dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../dto/output/item/item.delete.output.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { of } from 'rxjs';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';

describe('ItemDeleteService', () => {
  let itemDeleteService: ItemDeleteService;
  let itemsDatasource: ItemsDatasource;
  let logger: Logger;

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
      ],
    }).compile();

    itemDeleteService = module.get<ItemDeleteService>(ItemDeleteService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    logger = module.get<Logger>(Logger);
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
  });
});
