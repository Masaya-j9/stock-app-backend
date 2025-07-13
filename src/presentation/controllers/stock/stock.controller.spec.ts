import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockListService } from '../../../application/services/stock/stock.list.service';
import { StockListServiceInterface } from '../../../application/services/stock/stock.list.interface';
import { StockListInputDto } from '../../../application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from '../../../application/dto/output/stock/stock.list.output.dto';
import { of, throwError } from 'rxjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StocksDatasource } from '../../../infrastructure/datasources/stocks/stocks.datasource';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';

describe('StockController', () => {
  let controller: StockController;
  let stockListService: StockListServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        StockListService,
        {
          provide: 'StockListServiceInterface',
          useClass: StockListService,
        },
        {
          provide: StocksDatasource,
          useValue: {
            findStockList: jest.fn(() => of([])),
            countAll: jest.fn(() => of(0)),
          },
        },
        {
          provide: ItemsDatasource,
          useValue: {
            findItemsByIds: jest.fn(() => of([])),
          },
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    stockListService = module.get<StockListServiceInterface>(
      'StockListServiceInterface'
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findStockList', () => {
    it('レスポンスが返却されること', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };
      const result: StockListOutputDto = {
        count: 1,
        totalPages: 1,
        results: [
          {
            id: 1,
            quantity: 10,
            description: 'テスト在庫',
            createdAt: new Date(),
            updatedAt: new Date(),
            item: { id: 1, name: 'Item 1' },
          },
        ],
      };

      jest.spyOn(stockListService, 'service').mockReturnValue(of(result));

      controller.findStockList(query).subscribe({
        next: (response: StockListOutputDto) => {
          expect(response).toBe(result);
          expect(stockListService.service).toHaveBeenCalledWith(query);
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
      const query: StockListInputDto = { pages: -1, sortOrder: 0 };
      jest
        .spyOn(stockListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );

      controller.findStockList(query).subscribe({
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
      const query: StockListInputDto = { pages: 1, sortOrder: 3 };
      jest
        .spyOn(stockListService, 'service')
        .mockImplementation(() =>
          throwError(() => new BadRequestException('Validation failed'))
        );

      controller.findStockList(query).subscribe({
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

    it('在庫が見つからない場合、404エラーを返す', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };
      jest
        .spyOn(stockListService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Stocks not found'))
        );

      controller.findStockList(query).subscribe({
        next: () => {
          fail('Expected 404 error, but received results');
        },
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.statusCode).toBe(404);
          expect(err.response.message).toBe('Stocks not found');
          done();
        },
        complete: () => {
          done();
        },
      });
    });

    it('在庫に関連するアイテムが見つからない場合、404エラーを返す', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };
      jest
        .spyOn(stockListService, 'service')
        .mockImplementation(() =>
          throwError(() => new NotFoundException('Items not found'))
        );

      controller.findStockList(query).subscribe({
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
  });
});
