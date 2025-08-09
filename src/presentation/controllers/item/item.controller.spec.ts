import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemListService } from '../../../application/services/item/item.list.service';
import { ItemRegisterService } from '../../../application/services/item/item.register.service';
import { ItemUpdateService } from '../../../application/services/item/item.update.service';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemDeleteService } from '../../../application/services/item/item.delete.service';
import { ItemSingleService } from '../../../application/services/item/item.single.service';
import { DeletedItemListService } from '../../../application/services/item/deleted.item.list.service';
import { DeletedItemSingleService } from '../../../application/services/item/deleted.item.single.service';
import { UpdateItemQuantityService } from '../../../application/services/item/update.item.quantity.service';
import { ItemRestoreService } from '../../../application/services/item/item.restore.service';
import { ItemRegisterServiceInterface } from '../../../application/services/item/item.register.interface';
import { ItemUpdateServiceInterface } from '../../../application/services/item/item.update.interface';
import { ItemDeleteServiceInterface } from '../../../application/services/item/item.delete.interface';
import { DeletedItemSingleServiceInterface } from '../../../application/services/item/deleted.item.single.interface';
import { ItemSingleServiceInterface } from '../../../application/services/item/item.single.interface';
import { DeletedItemListServiceInterface } from '../../../application/services/item/deleted.item.list.interface';
import { ItemRestoreServiceInterface } from '../../../application/services/item/item.restore.interface';
import { UpdateItemQuantityServiceInterface } from '../../../application/services/item/update.item.quantity.interface';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { ItemUpdateInputDto } from '../../../application/dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../../application/dto/output/item/item.update.output.dto';
import { ItemDeleteInputDto } from '../../../application/dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../../application/dto/output/item/item.delete.output.dto';
import { DeletedItemSingleInputDto } from '../../../application/dto/input/item/deleted.item.single.input.dto';
import { DeletedItemSingleOutputDto } from '../../../application/dto/output/item/deleted.item.single.output.dto';
import { ItemSingleInputDto } from '../../../application/dto/input/item/item.single.input.dto';
import { ItemSingleOutputDto } from '../../../application/dto/output/item/item.single.output.dto';
import { DeletedItemListInputDto } from '../../../application/dto/input/item/deleted.item.list.input.dto';
import { DeletedItemListOutputDto } from '../../../application/dto/output/item/deleted.item.list.output.dto';
import { ItemRestoreInputDto } from '../../../application/dto/input/item/item.restore.input.dto';
import { ItemRestoreOutputDto } from '../../../application/dto/output/item/item.restore.output.dto';
import { UpdateItemQuantityInputDto } from '../../../application/dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../../application/dto/output/item/update.item.quantity.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { of, throwError } from 'rxjs';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Logger } from '@nestjs/common';

describe('ItemController', () => {
  let controller: ItemController;
  let itemListService: ItemListServiceInterface;
  let itemRegisterService: ItemRegisterServiceInterface;
  let itemUpdateService: ItemUpdateServiceInterface;
  let itemDeleteService: ItemDeleteServiceInterface;
  let itemSingleService: ItemSingleServiceInterface;
  let deletedItemListService: DeletedItemListServiceInterface;
  let deletedItemSingleService: DeletedItemSingleServiceInterface;
  let itemRestoreService: ItemRestoreServiceInterface;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;
  let updateItemQuantityService: UpdateItemQuantityServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        ItemListService, // 実際のサービスを提供
        ItemRegisterService,
        ItemUpdateService,
        ItemDeleteService,
        ItemSingleService,
        DeletedItemListService,
        ItemRestoreService,
        {
          provide: 'ItemListServiceInterface',
          useClass: ItemListService, // インターフェースを実装するクラスを提供
        },
        {
          provide: 'ItemRegisterServiceInterface',
          useClass: ItemRegisterService,
        },
        {
          provide: 'ItemUpdateServiceInterface',
          useClass: ItemUpdateService,
        },
        {
          provide: 'ItemDeleteServiceInterface',
          useClass: ItemDeleteService,
        },
        {
          provide: 'DeletedItemSingleServiceInterface',
          useClass: DeletedItemSingleService,
        },
        {
          provide: 'ItemSingleServiceInterface',
          useClass: ItemSingleService,
        },
        {
          provide: 'DeletedItemListServiceInterface',
          useClass: DeletedItemListService,
        },
        {
          provide: 'ItemRestoreServiceInterface',
          useClass: ItemRestoreService,
        },
        {
          provide: 'UpdateItemQuantityServiceInterface',
          useClass: UpdateItemQuantityService,
        },
        {
          provide: ItemsDatasource,
          useValue: {
            findItemList: jest.fn(() => of([])),
            findItemByName: jest.fn(() => of(undefined)),
            countAll: jest.fn(() => of(0)),
            createItemWithinTransaction: jest.fn(() => of({})),
            createItemCategoryWithinTransaction: jest.fn(() => of({})),
            findItemById: jest.fn(() => of({})),
            findCategoryIdsByItemId: jest.fn(() => of([])),
            updateItemWithinTransactionQuery: jest.fn(() => of({})),
            updateItemCategoriesWithinTransactionQuery: jest.fn(() => of({})),
            countDeletedAll: jest.fn(() => of(0)),
            findDeletedItemList: jest.fn(() => of([])),
            findDeletedItemById: jest.fn(() => of({})),
            updateQuantityById: jest.fn(() => of({})),
            DataSource: {
              transaction: jest.fn((cb) => cb({})),
            },
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategoryIds: jest.fn(() => of([])),
            findCategoriesByItemId: jest.fn(() => of([])),
          },
        },
        {
          provide: 'ItemCreatedEventPublisherInterface',
          useValue: {
            publishItemCreatedEvent: jest.fn(() => of(undefined)),
          },
        },
        {
          provide: 'ItemUpdatedEventPublisherInterface',
          useValue: {
            publishItemUpdatedEvent: jest.fn(() => of(undefined)),
          },
        },
        {
          provide: 'ItemQuantityUpdatedEventPublisherInterface',
          useValue: {
            publishItemQuantityUpdatedEvent: jest.fn(() => of(undefined)),
          },
        },
        {
          provide: 'ItemDeletedEventPublisherInterface',
          useValue: {
            publishItemDeletedEvent: jest.fn(() => of(undefined)),
          },
        },
        {
          provide: 'ItemRestoreEventPublisherInterface',
          useValue: {
            publishItemRestoreEvent: jest.fn(() => of(undefined)),
          },
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

    controller = module.get<ItemController>(ItemController);
    itemListService = module.get<ItemListServiceInterface>(
      'ItemListServiceInterface'
    );
    itemRegisterService = module.get<ItemRegisterServiceInterface>(
      'ItemRegisterServiceInterface'
    );
    itemUpdateService = module.get<ItemUpdateServiceInterface>(
      'ItemUpdateServiceInterface'
    );
    itemDeleteService = module.get<ItemDeleteServiceInterface>(
      'ItemDeleteServiceInterface'
    );
    itemSingleService = module.get<ItemSingleServiceInterface>(
      'ItemSingleServiceInterface'
    );
    deletedItemListService = module.get<DeletedItemListServiceInterface>(
      'DeletedItemListServiceInterface'
    );
    deletedItemSingleService = module.get<DeletedItemSingleServiceInterface>(
      'DeletedItemSingleServiceInterface'
    );
    itemRestoreService = module.get<ItemRestoreServiceInterface>(
      'ItemRestoreServiceInterface'
    );
    updateItemQuantityService = module.get<UpdateItemQuantityServiceInterface>(
      'UpdateItemQuantityServiceInterface'
    );
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findItemList', () => {
    it('レスポンスが返却されること', (done) => {
      const query: ItemListInputDto = { pages: 1, sortOrder: 0 };
      const result: ItemListOutputDto = {
        count: 2,
        totalPages: 1,
        results: [
          {
            id: 1,
            name: 'Item 1',
            quantity: 10,
            description: 'Description 1',
            itemsCategories: [],
          },
          {
            id: 2,
            name: 'Item 2',
            quantity: 20,
            description: 'Description 2',
            itemsCategories: [],
          },
        ],
      };

      jest.spyOn(itemListService, 'service').mockReturnValue(of(result));

      controller.findItemList(query).subscribe({
        next: (response: ItemListOutputDto) => {
          expect(response).toBe(result);
          expect(itemListService.service).toHaveBeenCalledWith(query);
        },
        error: (err: any) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('ページ番号が不正な値のとき、400を返す', (done) => {
      const query: ItemListInputDto = { pages: -1, sortOrder: 0 };
      jest
        .spyOn(itemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );

      controller.findItemList(query).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('sortOrderが不正な値の場合、400を返す', (done) => {
      const query: ItemListInputDto = { pages: 1, sortOrder: 3 };
      jest
        .spyOn(itemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.findItemList(query).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('findDeletedItemList', () => {
    it('削除された物品一覧を取得する', (done) => {
      const query: DeletedItemListInputDto = { pages: 1, sortOrder: 0 };
      const result: DeletedItemListOutputDto = {
        count: 2,
        totalPages: 1,
        results: [
          {
            id: 1,
            name: 'Item 1',
            quantity: 10,
            description: 'Description 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
            itemsCategories: [
              {
                id: 1,
                name: 'Category 1',
                description: 'Description 1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
              },
            ],
          },
          {
            id: 2,
            name: 'Item 2',
            quantity: 20,
            description: 'Description 2',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
            itemsCategories: [
              {
                id: 2,
                name: 'Category 2',
                description: 'Description 2',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
              },
            ],
          },
        ],
      };
      jest.spyOn(deletedItemListService, 'service').mockReturnValue(of(result));
      controller.findDeletedItemList(query).subscribe({
        next: (response: DeletedItemListOutputDto) => {
          expect(response).toBe(result);
          expect(deletedItemListService.service).toHaveBeenCalledWith(query);
        },
        error: (err: any) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });
    it('ページ番号が不正な値のとき、400を返す', (done) => {
      const query: DeletedItemListInputDto = { pages: -1, sortOrder: 0 };
      jest
        .spyOn(deletedItemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.findDeletedItemList(query).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('sortOrderが不正な値の場合、400を返す', (done) => {
      const query: DeletedItemListInputDto = { pages: 1, sortOrder: 3 };
      jest
        .spyOn(deletedItemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.findDeletedItemList(query).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('削除された物品が存在しない場合、404エラーを返す', (done) => {
      const query: DeletedItemListInputDto = { pages: 1, sortOrder: 0 };
      jest
        .spyOn(deletedItemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Items not found'))
        );
      controller.findDeletedItemList(query).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Items not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('削除された物品のカテゴリが存在しない場合、404エラーを返す', (done) => {
      const query: DeletedItemListInputDto = { pages: 1, sortOrder: 0 };
      jest
        .spyOn(deletedItemListService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Categories not found'))
        );
      controller.findDeletedItemList(query).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Categories not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('DeletedItemSingleService', () => {
    it('論理削除された物品を1件取得できる', (done) => {
      const input: DeletedItemSingleInputDto = { id: 1 };
      const mockItem: DeletedItemSingleOutputDto = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        itemCategories: [
          {
            id: 1,
            name: 'Category 1',
            description: 'Description 1',
          },
        ],
      };

      jest
        .spyOn(deletedItemSingleService, 'service')
        .mockReturnValue(of(mockItem));

      controller.findDeletedItemSingle(input.id).subscribe({
        next: (response) => {
          expect(response).toEqual(mockItem);
          expect(deletedItemSingleService.service).toHaveBeenCalledWith(input);
        },
        error: (err) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('論理削除された物品が存在しない場合、404エラーを返す', (done) => {
      const input: DeletedItemSingleInputDto = { id: 1 };
      jest
        .spyOn(deletedItemSingleService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );

      controller.findDeletedItemSingle(input.id).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('論理削除された物品IDが不正な場合、400エラーを返す', (done) => {
      const input: DeletedItemSingleInputDto = { id: -1 };
      jest
        .spyOn(deletedItemSingleService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.findDeletedItemSingle(input.id).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('restoreDeletedItem', () => {
    //item.restore.serviceのテスト
    it('物品を復元できる', (done) => {
      const input: ItemRestoreInputDto = { id: 1 };
      const mockItem: ItemRestoreOutputDto = {
        id: 1,
        name: 'Restored Item',
        quantity: 10,
        description: 'Restored Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(itemRestoreService, 'service').mockReturnValue(of(mockItem));

      controller.restoreDeletedItem(input.id).subscribe({
        next: (response) => {
          expect(response).toEqual(mockItem);
          expect(itemRestoreService.service).toHaveBeenCalledWith(input);
        },
        error: (err) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品が存在しない場合、404を返す', (done) => {
      const input = { id: 1 };
      jest
        .spyOn(itemRestoreService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.restoreDeletedItem(input.id).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品のカテゴリが見つからない場合、404を返す', (done) => {
      const input = { id: 1 };
      jest
        .spyOn(itemRestoreService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.restoreDeletedItem(input.id).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDが不正な場合、400を返す', (done) => {
      const input = { id: 1 };
      jest
        .spyOn(itemRestoreService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.restoreDeletedItem(input.id).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品が削除されていない場合、409を返す', (done) => {
      const input = { id: 1 };
      jest
        .spyOn(itemRestoreService, 'service')
        .mockImplementation(() =>
          throwError(() => new ConflictException('Item is not deleted'))
        );
      controller.restoreDeletedItem(input.id).subscribe({
        next: () => {
          fail('Expected 409 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.response.statusCode).toBe(409);
          expect(err.response.message).toBe('Item is not deleted');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('トランザクション中にエラーが発生した場合、500を返す', (done) => {
      const input = { id: 1 };
      jest
        .spyOn(itemRestoreService, 'service')
        .mockImplementation(() =>
          throwError(
            () => new InternalServerErrorException('Transaction failed')
          )
        );
      controller.restoreDeletedItem(input.id).subscribe({
        next: () => {
          fail('Expected 500 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(InternalServerErrorException);
          expect(err.response.statusCode).toBe(500);
          expect(err.response.message).toBe('Transaction failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('registerItem', () => {
    it('物品を登録する', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        categoryIds: [1, 2],
      };

      const isUniqueItem = undefined;
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
      const mockItem = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        itemsCategories: [],
      };

      const result = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        itemsCategories: [
          {
            id: 1,
            name: 'Category 1',
            description: 'Description 1',
          },
          {
            id: 2,
            name: 'Category 2',
            description: 'Description 2',
          },
        ],
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
      jest.spyOn(itemRegisterService, 'service').mockReturnValue(of(result));

      controller.registerItem(input).subscribe({
        next: (result) => {
          expect(result).toMatchObject({
            id: result.id,
            name: result.name,
            quantity: result.quantity,
            description: result.description,
            itemsCategories: expect.any(Array),
          });
        },
        error: (err) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名の文字列が空文字の場合、400エラーを返す', (done) => {
      const input = {
        name: '',
        quantity: 10,
        description: 'Description 1',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名が255文字より多い場合、400エラーを返す', (done) => {
      const input = {
        name: 'a'.repeat(256),
        quantity: 10,
        description: 'Description 1',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品の個数が0個以下の場合、400エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 0,
        description: 'Description 1',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );

      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品の個数が1000個より多い場合は、400エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 1001,
        description: 'Description 1',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品の説明文が空の場合、400エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: '',
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品の説明文が255文字より多い場合、400エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: 'a'.repeat(256),
        categoryIds: [1, 2],
      };

      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリIDが空の場合、400エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        categoryIds: [],
      };
      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );

      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名がすでに登録されいている場合、409エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        categoryIds: [1, 2],
      };
      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new ConflictException('Item already exists'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 409 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.response.statusCode).toBe(409);
          expect(err.response.message).toBe('Item already exists');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリIDが登録されていなかった場合、404エラーを返す', (done) => {
      const input = {
        name: 'Item 1',
        quantity: 10,
        description: 'Description 1',
        categoryIds: [1, 2],
      };
      jest
        .spyOn(itemRegisterService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.registerItem(input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('updateItem', () => {
    it('物品を更新できる', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };

      const result: ItemUpdateOutputDto = {
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
      jest.spyOn(itemUpdateService, 'service').mockReturnValue(of(result));

      controller.updateItem(inputItemId, input).subscribe({
        next: (response) => {
          expect(response).toEqual(result);
          expect(itemUpdateService.service).toHaveBeenCalledWith(
            input,
            inputItemId
          );
        },
        error: (err) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDが存在しない場合、404エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリIDが空の場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリIDが登録されていなかった場合、404エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名の文字列が空文字の場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: '',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品名が255文字より多い場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'a'.repeat(256),
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('説明文が空の場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: '',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('説明文が255文字より多い場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'a'.repeat(256),
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('数量が1個未満の場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 0,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('数量が1000個より多い場合、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 1001,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Validation failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新する物品が存在しない場合、404エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新後の物品名と他の物品名が同じ場合、409エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new ConflictException('This value is not unique'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 409 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.response.statusCode).toBe(409);
          expect(err.response.message).toBe('This value is not unique');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('itemエンティティの更新処理が失敗したとき、400エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Invalid update parameters'))
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Invalid update parameters');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('トランザクション処理に失敗したとき、500エラーを返す', (done) => {
      const inputItemId = 1;
      const input: ItemUpdateInputDto = {
        name: 'updatedItemName',
        quantity: 11,
        description: 'updatedItemDescription',
        categoryIds: [1, 2, 3],
      };
      jest
        .spyOn(itemUpdateService, 'service')
        .mockImplementation(() =>
          throwError(
            () => new InternalServerErrorException('Transaction failed')
          )
        );
      controller.updateItem(inputItemId, input).subscribe({
        next: () => {
          fail('Expected 500 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(InternalServerErrorException);
          expect(err.response.statusCode).toBe(500);
          expect(err.response.message).toBe('Transaction failed');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('deleteItem', () => {
    it('正常に論理削除することができる', (done) => {
      const input: ItemDeleteInputDto = {
        itemId: 1,
      };
      const result: ItemDeleteOutputDto = {
        id: 1,
        name: 'itemName',
        quantity: 10,
        description: 'itemDescription',
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      jest
        .spyOn(itemDeleteService, 'service')
        .mockImplementation(() => of(result));
      controller.deleteItem(input.itemId).subscribe({
        next: (response) => {
          expect(response).toEqual(result);
          expect(response.id).toBe(result.id);
          expect(response.name).toBe(result.name);
          expect(response.quantity).toBe(result.quantity);
          expect(response.description).toBe(result.description);
        },
        error: (err) => {
          fail('Expected no error, but received an error: ' + err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDが存在しないとき、404エラーを返す', (done) => {
      const input: ItemDeleteInputDto = {
        itemId: 1,
      };
      jest
        .spyOn(itemDeleteService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.deleteItem(input.itemId).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDに関連するカテゴリが存在しないとき、404エラーを返す', (done) => {
      const input: ItemDeleteInputDto = {
        itemId: 1,
      };
      jest
        .spyOn(itemDeleteService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.deleteItem(input.itemId).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDがすでに論理削除されている場合、409エラーを返す', (done) => {
      const input: ItemDeleteInputDto = {
        itemId: 1,
      };
      jest
        .spyOn(itemDeleteService, 'service')
        .mockImplementation(() =>
          throwError(() => new ConflictException('Item already deleted'))
        );
      controller.deleteItem(input.itemId).subscribe({
        next: () => {
          fail('Expected 409 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.response.statusCode).toBe(409);
          expect(err.response.message).toBe('Item already deleted');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('findItemSingle', () => {
    it('正常に物品を取得できる', (done) => {
      const input: ItemSingleInputDto = {
        itemId: 1,
      };
      const result: ItemSingleOutputDto = {
        id: 1,
        name: 'itemName',
        quantity: 10,
        description: 'itemDescription',
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCategories: [
          {
            id: 1,
            name: 'categoryName',
            description: 'categoryDescription',
          },
          {
            id: 2,
            name: 'categoryName',
            description: 'categoryDescription',
          },
        ],
      };
      jest
        .spyOn(itemSingleService, 'service')
        .mockImplementation(() => of(result));
      controller.findItemSingle(input.itemId).subscribe({
        next: (response) => {
          expect(response).toEqual(result);
          expect(response.id).toBe(result.id);
          expect(response.name).toBe(result.name);
          expect(response.quantity).toBe(result.quantity);
          expect(response.description).toBe(result.description);
        },
        error: (err) => {
          fail('Expected no error, but received an error: ' + err);
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDが存在しない場合、404エラーを返す', (done) => {
      const input: ItemSingleInputDto = {
        itemId: 1,
      };
      jest
        .spyOn(itemSingleService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.findItemSingle(input.itemId).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDに関連するカテゴリが存在しない場合、404エラーを返す', (done) => {
      const input: ItemSingleInputDto = {
        itemId: 1,
      };
      jest
        .spyOn(itemSingleService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.findItemSingle(input.itemId).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('物品IDが0以下の数値だった場合、400エラーを返す', (done) => {
      const input: ItemSingleInputDto = {
        itemId: 0,
      };
      jest
        .spyOn(itemSingleService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Invalid itemId'))
        );
      controller.findItemSingle(input.itemId).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Invalid itemId');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });

  describe('updateItemQuantity', () => {
    it('正常に物品の数量を更新できる', (done) => {
      const itemId = 1;
      const input: UpdateItemQuantityInputDto = {
        quantity: 10,
      };
      const output: UpdateItemQuantityOutputDto = {
        id: itemId,
        quantity: 10,
        updatedAt: new Date(),
      };

      jest
        .spyOn(updateItemQuantityService, 'service')
        .mockReturnValue(of(output));

      controller.updateItemQuantity(itemId, input).subscribe({
        next: (result) => {
          expect(result).toEqual(output);
          expect(updateItemQuantityService.service).toHaveBeenCalledWith(
            input,
            itemId
          );
          done();
        },
        error: (error) => done(error),
      });
    });

    it('物品IDが存在しない場合、404エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = {
        quantity: 11,
      };
      const itemId = 1;
      jest
        .spyOn(updateItemQuantityService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Item not found'))
        );
      controller.updateItemQuantity(itemId, input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Item not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('指定した物品IDに関連するカテゴリが存在しない場合、404エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = {
        quantity: 11,
      };
      const itemId = 1;
      jest
        .spyOn(updateItemQuantityService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Category not found'))
        );
      controller.updateItemQuantity(itemId, input).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Category not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('更新後の数量が0以下の場合、400エラーを返す', (done) => {
      const input: UpdateItemQuantityInputDto = {
        quantity: 0,
      };
      const itemId = 1;
      jest
        .spyOn(updateItemQuantityService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Invalid quantity'))
        );
      controller.updateItemQuantity(itemId, input).subscribe({
        next: () => {
          fail('Expected 400 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.response.statusCode).toBe(400);
          expect(err.response.message).toBe('Invalid quantity');
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
