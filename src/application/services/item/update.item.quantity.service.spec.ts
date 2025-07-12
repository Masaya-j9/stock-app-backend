import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateItemQuantityService } from './update.item.quantity.service';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { UpdateItemQuantityInputDto } from '../../dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../dto/output/item/update.item.quantity.output.dto';
import { of } from 'rxjs';
import { Items } from '../../../infrastructure/orm/entities/items.entity';

describe('UpdateItemQuantityService', () => {
  let updateItemQuantityService: UpdateItemQuantityService;
  let itemsDatasource: ItemsDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateItemQuantityService,
        {
          provide: ItemsDatasource,
          useValue: {
            findItemById: jest.fn(),
            findCategoryIdsByItemId: jest.fn(),
            updateQuantityById: jest.fn(),
            dataSource: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {},
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    updateItemQuantityService = module.get<UpdateItemQuantityService>(
      UpdateItemQuantityService
    );
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
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

      jest
        .spyOn(itemsDatasource.dataSource, 'transaction')
        .mockImplementation(async (cb: any) => {
          // managerはダミーでOK
          return await cb({});
        });

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
      jest
        .spyOn(itemsDatasource.dataSource, 'transaction')
        .mockImplementation(async (cb: any) => {
          return await cb({});
        });

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
});
