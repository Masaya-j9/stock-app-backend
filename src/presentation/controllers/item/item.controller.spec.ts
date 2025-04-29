import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemListService } from '../../../application/services/item/item.list.service';
import { ItemRegisterService } from '../../../application/services/item/item.register.service';
import { ItemUpdateService } from '../../../application/services/item/item.update.service';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemDeleteService } from '../../../application/services/item/item.delete.service';
import { ItemRegisterServiceInterface } from '../../../application/services/item/item.register.interface';
import { ItemUpdateServiceInterface } from '../../../application/services/item/item.update.interface';
import { ItemDeleteServiceInterface } from '../../../application/services/item/item.delete.interface';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { ItemUpdateInputDto } from '../../../application/dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../../application/dto/output/item/item.update.output.dto';
import { ItemDeleteInputDto } from '../../../application/dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../../application/dto/output/item/item.delete.output.dto';
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

describe('ItemController', () => {
  let controller: ItemController;
  let itemListService: ItemListServiceInterface;
  let itemRegisterService: ItemRegisterServiceInterface;
  let itemUpdateService: ItemUpdateServiceInterface;
  let itemDeleteService: ItemDeleteServiceInterface;
  let itemsDatasource: ItemsDatasource;
  let categoriesDatasource: CategoriesDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        ItemListService, // 実際のサービスを提供
        ItemRegisterService,
        ItemUpdateService,
        ItemDeleteService,
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
          provide: ItemsDatasource,
          useValue: {
            findItemList: jest.fn(() => of([])),
            findItemByName: jest.fn(() => of(undefined)),
            createItemWithinTransaction: jest.fn(() => of({})),
            createItemCategoryWithinTransaction: jest.fn(() => of({})),
            findItemById: jest.fn(() => of({})),
            findCategoryIdsByItemId: jest.fn(() => of([])),
            updateItemWithinTransactionQuery: jest.fn(() => of({})),
            updateItemCategoriesWithinTransactionQuery: jest.fn(() => of({})),
            DataSource: {
              transaction: jest.fn((cb) => cb({})),
            },
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategoryIds: jest.fn(() => of([])),
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

    it('更新後の物品名と現在の物品名が同じ場合、409エラーを返す', (done) => {
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
});
