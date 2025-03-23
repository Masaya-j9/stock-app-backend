import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemListService } from '../../../application/services/item/item.list.service';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

describe('ItemController', () => {
  let controller: ItemController;
  let itemListService: ItemListServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        ItemListService, // 実際のサービスを提供
        {
          provide: 'ItemListServiceInterface',
          useClass: ItemListService, // インターフェースを実装するクラスを提供
        },
        {
          provide: ItemsDatasource,
          useValue: {
            findItemList: jest.fn(() => of([])),
          },
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategories: jest.fn(() => of([])),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    itemListService = module.get<ItemListServiceInterface>(
      'ItemListServiceInterface'
    );
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
});
