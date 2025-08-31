import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { StockRegisterService } from './stock.register.service';
import { StockRegisterInputDto } from '../../dto/input/stock/stock.register.input.dto';
import { StockRegisterOutputDto } from '../../dto/output/stock/stock.register.output.dto';
import {
  ITEMS_DATASOURCE_TOKEN,
  ItemsDatasourceInterface,
} from '../../../infrastructure/datasources/items/items.datasource.interface';
import {
  STOCKS_DATASOURCE_TOKEN,
  StocksDatasourceInterface,
} from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { EVENT_SOURCES, EventSource } from './constants/event.sources';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { StockStatuses } from '../../../infrastructure/orm/entities/stock.statuses.entity';
import { Stock } from '../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../domain/inventory/stocks/entities/stock.status.entity';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';

describe('StockRegisterService', () => {
  let stockRegisterService: StockRegisterService;
  let itemsDatasource: jest.Mocked<ItemsDatasourceInterface>;
  let stocksDatasource: jest.Mocked<StocksDatasourceInterface>;

  const mockItem: Items = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    itemCategories: [],
  };

  const mockStockStatus: StockStatuses = {
    id: 1,
    name: 'available',
    description: 'Available status',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    stocks: [],
  };

  const mockInputDto: StockRegisterInputDto = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    categoryIds: [1, 2],
    eventSource: EVENT_SOURCES.ITEM_CREATED,
    toItemCreatedEvent: jest.fn().mockReturnValue({
      id: 1,
      name: 'Test Item',
      quantity: 10,
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      categoryIds: [1, 2],
    }),
  };

  beforeEach(async () => {
    const mockItemsDatasource = {
      findItemById: jest.fn(),
    };

    const mockStocksDatasource = {
      getStatusByName: jest.fn(),
      createStockWithStatusIdInTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockRegisterService,
        {
          provide: ITEMS_DATASOURCE_TOKEN,
          useValue: mockItemsDatasource,
        },
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: mockStocksDatasource,
        },
      ],
    }).compile();

    stockRegisterService =
      module.get<StockRegisterService>(StockRegisterService);
    itemsDatasource = module.get(ITEMS_DATASOURCE_TOKEN);
    stocksDatasource = module.get(STOCKS_DATASOURCE_TOKEN);
  });

  it('should be defined', () => {
    expect(stockRegisterService).toBeDefined();
  });

  describe('service', () => {
    it('在庫登録が正常に完了する場合、Output DTOを返すこと', (done) => {
      const mockStockId = 123;

      itemsDatasource.findItemById.mockReturnValue(of(mockItem));
      stocksDatasource.getStatusByName.mockReturnValue(of(mockStockStatus));
      stocksDatasource.createStockWithStatusIdInTransaction.mockReturnValue(
        of(mockStockId)
      );

      stockRegisterService.service(mockInputDto).subscribe({
        next: (result: StockRegisterOutputDto) => {
          expect(result).toBeDefined();
          expect(result.id).toBe(mockStockId);
          expect(result.quantity).toBe(10);
          expect(result.description).toBe('Test Description');
          expect(result.item).toEqual({
            id: 1,
            name: 'Test Item',
          });
          expect(result.status).toEqual({
            id: 1,
            name: 'available',
            description: 'Available status',
          });

          expect(itemsDatasource.findItemById).toHaveBeenCalledWith(1);
          expect(stocksDatasource.getStatusByName).toHaveBeenCalledWith(
            'available'
          );
          expect(
            stocksDatasource.createStockWithStatusIdInTransaction
          ).toHaveBeenCalledWith(1, 10, 1, 'Test Description');

          done();
        },
        error: done.fail,
      });
    });

    it('不正なイベントソースの場合、エラーを投げること', (done) => {
      const invalidInputDto = {
        ...mockInputDto,
        eventSource: 'invalid.source' as EventSource,
        toItemCreatedEvent: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Item',
          quantity: 10,
          description: 'Test Description',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          categoryIds: [1, 2],
        }),
      };

      stockRegisterService.service(invalidInputDto).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error: Error) => {
          expect(error.message).toContain(
            'Unknown event source: invalid.source'
          );
          done();
        },
      });
    });

    it('アイテムが見つからない場合、NotFoundException を投げること', (done) => {
      itemsDatasource.findItemById.mockReturnValue(of(null));
      stocksDatasource.getStatusByName.mockReturnValue(of(mockStockStatus));

      stockRegisterService.service(mockInputDto).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error: NotFoundException) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Item not found');
          done();
        },
      });
    });

    it('ステータスが見つからない場合、NotFoundException を投げること', (done) => {
      itemsDatasource.findItemById.mockReturnValue(of(mockItem));
      stocksDatasource.getStatusByName.mockReturnValue(of(null));

      stockRegisterService.service(mockInputDto).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error: NotFoundException) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Stock status not found');
          done();
        },
      });
    });

    it('永続化処理でエラーが発生した場合、エラーを伝播すること', (done) => {
      const persistError = new Error('Database error');

      itemsDatasource.findItemById.mockReturnValue(of(mockItem));
      stocksDatasource.getStatusByName.mockReturnValue(of(mockStockStatus));
      stocksDatasource.createStockWithStatusIdInTransaction.mockReturnValue(
        throwError(() => persistError)
      );

      stockRegisterService.service(mockInputDto).subscribe({
        next: () => done.fail('Expected error but got success'),
        error: (error: Error) => {
          expect(error).toBe(persistError);
          done();
        },
      });
    });
  });

  describe('determineStockStatus (private method)', () => {
    it('正しいイベントソースに対して適切なステータス名を返すこと', () => {
      const result = stockRegisterService['determineStockStatus'](
        EVENT_SOURCES.ITEM_CREATED
      );
      expect(result).toBe('available');
    });

    it('不正なイベントソースに対してundefinedを返すこと', () => {
      const result = stockRegisterService['determineStockStatus'](
        'invalid.source' as EventSource
      );
      expect(result).toBeUndefined();
    });
  });

  describe('createStockEntity (private method)', () => {
    it('正しいStock entityを作成すること', () => {
      const event = {
        id: 1,
        quantity: 10,
        description: 'Test Description',
      };

      const result = stockRegisterService['createStockEntity'](
        mockItem,
        mockStockStatus,
        event
      );

      expect(result).toBeInstanceOf(Stock);
      expect(result.quantity.value()).toBe(10);
      expect(result.description).toBe('Test Description');
      expect(result.itemId).toBe(1);
      expect(result.status.name).toBe('available');
    });

    it('descriptionが空の場合、空文字を設定すること', () => {
      const event = {
        id: 1,
        quantity: 10,
        description: '',
      };

      const result = stockRegisterService['createStockEntity'](
        mockItem,
        mockStockStatus,
        event
      );

      expect(result.description).toBe('');
    });
  });

  describe('extractPersistenceData (private method)', () => {
    it('Stock entityから永続化用データを正しく抽出すること', () => {
      const mockQuantity = Quantity.of(10);
      const mockStatus = new StockStatus(
        1,
        'available',
        'Available status',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        null
      );
      const mockStock = new Stock(
        1,
        mockQuantity,
        'Test Description',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        null,
        1,
        mockStatus
      );

      const result = stockRegisterService['extractPersistenceData'](mockStock);

      expect(result).toEqual({
        itemId: 1,
        quantity: 10,
        statusId: 1,
        description: 'Test Description',
      });
    });
  });
});
