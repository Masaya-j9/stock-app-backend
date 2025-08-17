import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { StockListService } from './stock.list.service';
import { StocksDatasource } from '../../../infrastructure/datasources/stocks/stocks.datasource';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { Stocks } from '../../../infrastructure/orm/entities/stocks.entity';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { StockListInputDto } from '../../../application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from '../../../application/dto/output/stock/stock.list.output.dto';
import { NotFoundException } from '@nestjs/common';

describe('StockListService', () => {
  let stockListService: StockListService;
  let stocksDatasource: StocksDatasource;
  let itemsDatasource: ItemsDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockListService,
        {
          provide: StocksDatasource,
          useValue: {
            findStockList: jest.fn(),
            countAll: jest.fn(),
          },
        },
        {
          provide: ItemsDatasource,
          useValue: {
            findItemsByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    stockListService = module.get<StockListService>(StockListService);
    stocksDatasource = module.get<StocksDatasource>(StocksDatasource);
    itemsDatasource = module.get<ItemsDatasource>(ItemsDatasource);
  });

  it('should be defined', () => {
    expect(stockListService).toBeDefined();
  });

  describe('service', () => {
    it('登録されいている在庫情報を取得できること', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };

      const mockStocks = [
        {
          id: 1,
          quantity: 10,
          description: 'テスト在庫1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          item: {
            id: 1,
            name: 'Item 1',
            description: 'Description 1',
            quantity: 10,
            itemCategories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          status: {
            id: 1,
            name: 'In Stock',
            description: 'The item is in stock',
          },
        },
        {
          id: 2,
          quantity: 20,
          description: 'テスト在庫2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          item: {
            id: 2,
            name: 'Item 2',
            description: 'Description 2',
            quantity: 5,
            itemCategories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          status: {
            id: 2,
            name: 'Out of Stock',
            description: 'The item is out of stock',
          },
        },
      ] as Stocks[];

      const mockItems: Items[] = [
        {
          id: 1,
          name: 'Item 1',
          description: 'Description 1',
          quantity: 10,
          itemCategories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          name: 'Item 2',
          description: 'Description 2',
          quantity: 5,
          itemCategories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const mockStockListOutputDto: StockListOutputDto = {
        count: 2,
        totalPages: 1,
        results: [
          {
            id: 1,
            quantity: 10,
            description: 'テスト在庫1',
            createdAt: new Date(),
            updatedAt: new Date(),
            item: {
              id: 1,
              name: 'Item 1',
            },
            status: {
              id: 1,
              name: 'In Stock',
              description: 'The item is in stock',
            },
          },
          {
            id: 2,
            quantity: 20,
            description: 'テスト在庫2',
            createdAt: new Date(),
            updatedAt: new Date(),
            item: {
              id: 2,
              name: 'Item 2',
            },
            status: {
              id: 2,
              name: 'Out of Stock',
              description: 'The item is out of stock',
            },
          },
        ],
      };

      jest
        .spyOn(stocksDatasource, 'findStockList')
        .mockReturnValue(of(mockStocks));
      jest
        .spyOn(itemsDatasource, 'findItemsByIds')
        .mockReturnValue(of(mockItems));
      jest.spyOn(stocksDatasource, 'countAll').mockReturnValue(of(2));

      stockListService.service(query).subscribe({
        next: (response: StockListOutputDto) => {
          expect(response).toEqual(mockStockListOutputDto);
        },
        error: (error) => {
          console.error(error);
          done(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('在庫が見つからない場合、404エラーを返す', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };
      const error = new NotFoundException('Stocks not found');
      const stocksDatasourceSpy = jest.spyOn(stocksDatasource, 'findStockList');
      const itemsDatasourceSpy = jest.spyOn(itemsDatasource, 'findItemsByIds');
      const stocksDatasourceCountAllSpy = jest.spyOn(
        stocksDatasource,
        'countAll'
      );

      stocksDatasourceSpy.mockReturnValue(of([]));
      itemsDatasourceSpy.mockReturnValue(of([]));
      stocksDatasourceCountAllSpy.mockReturnValue(of(0));

      stockListService.service(query).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (thrownError) => {
          expect(thrownError).toEqual(error);
          done();
        },
        complete: () => {
          fail('Expected an error to be thrown');
        },
      });
    });

    it('在庫に関連するアイテムが見つからない場合、404エラーを返す', (done) => {
      const query: StockListInputDto = { pages: 1, sortOrder: 0 };
      const error = new NotFoundException('Items not found');
      const stocksDatasourceSpy = jest.spyOn(stocksDatasource, 'findStockList');
      const itemsDatasourceSpy = jest.spyOn(itemsDatasource, 'findItemsByIds');
      const stocksDatasourceCountAllSpy = jest.spyOn(
        stocksDatasource,
        'countAll'
      );
      const mockStocks = [
        {
          id: 1,
          quantity: 10,
          description: 'テスト在庫1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          item: {
            id: 1,
            name: 'Item 1',
            description: 'Description 1',
            quantity: 10,
            itemCategories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        },
      ] as Stocks[];

      stocksDatasourceSpy.mockReturnValue(of(mockStocks));
      itemsDatasourceSpy.mockReturnValue(of([]));
      stocksDatasourceCountAllSpy.mockReturnValue(of(1));

      stockListService.service(query).subscribe({
        next: () => {
          fail('Expected an error to be thrown');
        },
        error: (thrownError) => {
          expect(thrownError).toEqual(error);
          done();
        },
        complete: () => {
          fail('Expected an error to be thrown');
        },
      });
    });
  });
});
