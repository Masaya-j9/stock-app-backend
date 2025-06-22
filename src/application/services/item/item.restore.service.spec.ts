import { Test, TestingModule } from '@nestjs/testing';
import { ItemRestoreService } from './item.restore.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemRestoreInputDto } from '../../dto/input/item/item.restore.input.dto';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { of, throwError } from 'rxjs';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ItemRestoreService', () => {
  let itemRestoreService: ItemRestoreService;
  let itemsDatasource: ItemsDatasource;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemRestoreService,
        {
          provide: ItemsDatasource,
          useValue: {
            dataSource: {
              createQueryRunner: jest.fn(() => mockQueryRunner),
            },
            findDeletedItemById: jest.fn(),
            findCategoryIdsByItemId: jest.fn(),
            restoreDeletedItemById: jest.fn(),
          },
        },
      ],
    }).compile();

    itemRestoreService = module.get<ItemRestoreService>(ItemRestoreService);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);

    logSpy = jest
      .spyOn(itemRestoreService['logger'], 'log')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(itemRestoreService).toBeDefined();
  });

  describe('service', () => {
    it('削除された物品を復元する', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };
      const mockItem: Items = {
        id: input.id,
        name: 'Restored Item',
        quantity: 5,
        description: 'Restored Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        itemCategories: [],
      };

      const mockCategoryIds = [1, 2];

      jest
        .spyOn(itemsDatasource, 'findDeletedItemById')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of(mockCategoryIds));
      jest
        .spyOn(itemsDatasource, 'restoreDeletedItemById')
        .mockReturnValue(of(mockItem));

      itemRestoreService.service(input).subscribe({
        next: (output) => {
          expect(output.id).toEqual(mockItem.id);
          expect(output.name).toEqual(mockItem.name);
          expect(output.quantity).toEqual(mockItem.quantity);
          expect(output.description).toEqual(mockItem.description);
          expect(logSpy).toHaveBeenCalledWith(
            `Starting restore for item with ID: ${input.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Successfully restored item with ID: ${mockItem.id}`
          );
        },
        error: (err) => {
          done.fail(`Expected successful restoration, but got error: ${err}`);
        },
        complete: () => {
          expect(itemsDatasource.findDeletedItemById).toHaveBeenCalledWith(
            input.id
          );
          expect(itemsDatasource.findCategoryIdsByItemId).toHaveBeenCalledWith(
            input.id
          );
          expect(itemsDatasource.restoreDeletedItemById).toHaveBeenCalledWith(
            mockItem.id,
            expect.anything()
          );
          done();
        },
      });
    });

    it('物品が見つからない場合は404エラーを返す', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };

      jest
        .spyOn(itemsDatasource, 'findDeletedItemById')
        .mockReturnValue(
          throwError(
            () => new NotFoundException(`Item with ID ${input.id} not found`)
          )
        );
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1, 2]));

      itemRestoreService.service(input).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(`Item with ID ${input.id} not found`);
          done();
        },
        complete: () => {
          fail('Expected an error to be thrown');
        },
      });
    });

    it('物品のカテゴリが見つからない場合は404エラーを返す', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };
      const mockItem: Items = {
        id: input.id,
        name: 'Restored Item',
        quantity: 5,
        description: 'Restored Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        itemCategories: [],
      };
      jest
        .spyOn(itemsDatasource, 'findDeletedItemById')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(
          throwError(
            () =>
              new NotFoundException(
                `Categories not found for item ID ${input.id}`
              )
          )
        );
      itemRestoreService.service(input).subscribe({
        next: () => {
          done.fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(
            `Categories not found for item ID ${input.id}`
          );
          done();
        },
        complete: () => {
          done.fail(
            'Expected an error to be thrown, but completed successfully'
          );
        },
      });
    });

    it('物品が論理削除されていない場合は409を返す', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };
      const mockItem: Items = {
        id: input.id,
        name: 'Active Item',
        quantity: 5,
        description: 'Active Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // 論理削除されていない
        itemCategories: [],
      };

      jest
        .spyOn(itemsDatasource, 'findDeletedItemById')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1, 2]));

      itemRestoreService.service(input).subscribe({
        next: () => {
          done.fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.message).toBe(`Item with ID ${input.id} is not deleted`);
          done();
        },
        complete: () => {
          done.fail(
            'Expected an error to be thrown, but completed successfully'
          );
        },
      });
    });

    it('トランザクション処理中にエラーが発生した場合は、InternalServerErrorExceptionをスローする', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };
      const mockItem: Items = {
        id: input.id,
        name: 'Restored Item',
        quantity: 5,
        description: 'Restored Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        itemCategories: [],
      };

      jest
        .spyOn(itemsDatasource, 'findDeletedItemById')
        .mockReturnValue(of(mockItem));
      jest
        .spyOn(itemsDatasource, 'findCategoryIdsByItemId')
        .mockReturnValue(of([1, 2]));
      jest
        .spyOn(itemsDatasource, 'restoreDeletedItemById')
        .mockReturnValue(
          throwError(() => new Error('Database transaction error'))
        );

      itemRestoreService.service(input).subscribe({
        next: () => {
          done.fail('Expected an error to be thrown');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Database transaction error');
          done();
        },
        complete: () => {
          done.fail(
            'Expected an error to be thrown, but completed successfully'
          );
        },
      });
    });
  });
});
