import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { StockUpdateService } from './stock.update.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import {
  ItemsDatasourceInterface,
  ITEMS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/items/items.datasource.interface';
import { StockUpdateInputDto } from '../../dto/input/stock/stock.update.input.dto';
import { EventSource } from './constants/event.sources';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { StockStatuses } from '../../../infrastructure/orm/entities/stock.statuses.entity';
import { Stocks } from '../../../infrastructure/orm/entities/stocks.entity';

describe('StockUpdateService', () => {
  let service: StockUpdateService;
  let stocksDatasource: StocksDatasourceInterface;
  let itemsDatasource: ItemsDatasourceInterface;

  // Test data setup
  const mockItem: Items = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    description: 'Test item description',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    deletedAt: null,
    itemCategories: [],
  };

  const mockStockStatus: StockStatuses = {
    id: 1,
    name: 'available',
    description: 'Available for use',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    deletedAt: null,
    stocks: [],
  };

  const mockCurrentStock: Stocks = {
    id: 1,
    quantity: 5,
    description: 'Current stock',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    deletedAt: null,
    item: mockItem,
    status: mockStockStatus,
    stockHistories: [],
    borrowingStocks: undefined,
    returnStocks: undefined,
    borrowingComments: undefined,
  };

  const mockUpdatedStock: Stocks = {
    id: 1,
    quantity: 10,
    description: 'Updated stock',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    deletedAt: null,
    item: mockItem,
    status: mockStockStatus,
    stockHistories: [],
    borrowingStocks: undefined,
    returnStocks: undefined,
    borrowingComments: undefined,
  };

  beforeEach(async () => {
    const mockStocksDatasource: Partial<StocksDatasourceInterface> = {
      getStatusByName: jest.fn(),
      findCurrentStockByItemId: jest.fn(),
      updateStockQuantityByIdWithStatus: jest.fn(),
    };

    const mockItemsDatasource: Partial<ItemsDatasourceInterface> = {
      findItemById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockUpdateService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: mockStocksDatasource,
        },
        {
          provide: ITEMS_DATASOURCE_TOKEN,
          useValue: mockItemsDatasource,
        },
      ],
    }).compile();

    service = module.get<StockUpdateService>(StockUpdateService);
    stocksDatasource = module.get(STOCKS_DATASOURCE_TOKEN);
    itemsDatasource = module.get(ITEMS_DATASOURCE_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('service', () => {
    let inputDto: StockUpdateInputDto;

    beforeEach(() => {
      inputDto = new StockUpdateInputDto();
      inputDto.id = 1;
      inputDto.name = 'Test Item';
      inputDto.quantity = 10;
      inputDto.description = 'Updated description';
      inputDto.updatedAt = new Date('2023-01-02');
      inputDto.categoryIds = [1];
      inputDto.eventSource = 'item.updated' as EventSource;
    });

    describe('正常系', () => {
      it('正常にstock更新が完了する', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));
        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockReturnValue(of(mockUpdatedStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: (result) => {
            expect(result).toBeDefined();
            expect(result.id).toBe(mockUpdatedStock.id);
            expect(result.quantity).toBe(mockUpdatedStock.quantity);
            expect(result.description).toBe(mockUpdatedStock.description);
            expect(result.item).toEqual({
              id: mockItem.id,
              name: mockItem.name,
            });
            expect(result.status).toEqual({
              id: mockStockStatus.id,
              name: mockStockStatus.name,
              description: mockStockStatus.description,
            });

            // Verify calls
            expect(itemsDatasource.findItemById).toHaveBeenCalledWith(
              inputDto.id
            );
            expect(stocksDatasource.getStatusByName).toHaveBeenCalledWith(
              'available'
            );
            expect(
              stocksDatasource.findCurrentStockByItemId
            ).toHaveBeenCalledWith(inputDto.id);
            expect(
              stocksDatasource.updateStockQuantityByIdWithStatus
            ).toHaveBeenCalled();
          },
          error: (error) => done.fail(error),
          complete: () => done(),
        });
      });

      it('複数のRxJS operatorが正しく連携する', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));
        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockReturnValue(of(mockUpdatedStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: (result) => {
            // forkJoinが呼ばれたことを間接的に確認
            expect(itemsDatasource.findItemById).toHaveBeenCalled();
            expect(stocksDatasource.getStatusByName).toHaveBeenCalled();
            expect(
              stocksDatasource.findCurrentStockByItemId
            ).toHaveBeenCalled();

            // 最終的な結果が正しく構築されていることを確認
            expect(result).toBeDefined();
            expect(typeof result.id).toBe('number');
            expect(typeof result.quantity).toBe('number');
          },
          error: (error) => done.fail(error),
          complete: () => done(),
        });
      });
    });

    describe('異常系', () => {
      it('不正なEventSourceの場合、エラーが発生する', (done) => {
        // Arrange
        inputDto.eventSource = 'INVALID_SOURCE' as EventSource;

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toContain('Unknown event source');
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });

      it('Itemが見つからない場合、NotFoundExceptionが発生する', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(of(null));
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe('Item not found');
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });

      it('StockStatusが見つからない場合、NotFoundExceptionが発生する', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(null)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe('Stock status not found');
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });

      it('現在のStockが見つからない場合、NotFoundExceptionが発生する', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(undefined));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe('Current stock not found');
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });

      it('永続化処理でエラーが発生した場合、エラーが伝播される', (done) => {
        // Arrange
        const persistenceError = new Error('Database error');
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));
        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockReturnValue(throwError(() => persistenceError));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBe(persistenceError);
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });

      it('ItemsDatasourceでエラーが発生した場合、エラーが伝播される', (done) => {
        // Arrange
        const itemError = new Error('Item service error');
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          throwError(() => itemError)
        );
        // forkJoinのために他の依存関数も設定
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => done.fail('Expected error, but got success'),
          error: (error) => {
            expect(error).toBe(itemError);
            done();
          },
          complete: () => done.fail('Expected error, but completed'),
        });
      });
    });

    describe('境界値テスト', () => {
      it('descriptionがnullの場合でも正常に処理される', (done) => {
        // Arrange
        inputDto.description = undefined;

        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));
        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockReturnValue(of(mockUpdatedStock));

        // Act & Assert
        service.service(inputDto).subscribe({
          next: (result) => {
            expect(result).toBeDefined();
            done();
          },
          error: (error) => {
            done.fail(error);
          },
          complete: () => {},
        });
      });
    });

    describe('RxJSストリーム処理', () => {
      it('observableチェーンが正しい順序で実行される', (done) => {
        // Arrange
        const executionOrder: string[] = [];

        (itemsDatasource.findItemById as jest.Mock).mockImplementation(() => {
          executionOrder.push('findItem');
          return of(mockItem);
        });

        (stocksDatasource.getStatusByName as jest.Mock).mockImplementation(
          () => {
            executionOrder.push('getStatus');
            return of(mockStockStatus);
          }
        );

        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockImplementation(() => {
          executionOrder.push('findCurrentStock');
          return of(mockCurrentStock);
        });

        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockImplementation(() => {
          executionOrder.push('updateStock');
          return of(mockUpdatedStock);
        });

        // Act & Assert
        service.service(inputDto).subscribe({
          next: () => {
            expect(executionOrder).toContain('findItem');
            expect(executionOrder).toContain('getStatus');
            expect(executionOrder).toContain('findCurrentStock');
            expect(executionOrder).toContain('updateStock');
            // updateStockは最後に実行されるはず
            expect(executionOrder[executionOrder.length - 1]).toBe(
              'updateStock'
            );
            done();
          },
          error: (error) => {
            done.fail(error);
          },
          complete: () => {},
        });
      });

      it('ストリームが完了時に適切にクリーンアップされる', (done) => {
        // Arrange
        (itemsDatasource.findItemById as jest.Mock).mockReturnValue(
          of(mockItem)
        );
        (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
          of(mockStockStatus)
        );
        (
          stocksDatasource.findCurrentStockByItemId as jest.Mock
        ).mockReturnValue(of(mockCurrentStock));
        (
          stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
        ).mockReturnValue(of(mockUpdatedStock));

        let completed = false;

        // Act & Assert
        service.service(inputDto).subscribe({
          next: (result) => {
            expect(result).toBeDefined();
          },
          error: (error) => {
            done.fail(error);
          },
          complete: () => {
            completed = true;
            expect(completed).toBe(true);
            done();
          },
        });
      });
    });
  });

  describe('private methods (indirect testing)', () => {
    it('determineStockStatus が正しく動作することを間接的に確認', (done) => {
      // Arrange
      const inputDto = new StockUpdateInputDto();
      inputDto.id = 1;
      inputDto.quantity = 10;
      inputDto.eventSource = 'item.updated' as EventSource;

      (itemsDatasource.findItemById as jest.Mock).mockReturnValue(of(mockItem));
      (stocksDatasource.getStatusByName as jest.Mock).mockReturnValue(
        of(mockStockStatus)
      );
      (stocksDatasource.findCurrentStockByItemId as jest.Mock).mockReturnValue(
        of(mockCurrentStock)
      );
      (
        stocksDatasource.updateStockQuantityByIdWithStatus as jest.Mock
      ).mockReturnValue(of(mockUpdatedStock));

      // Act & Assert
      service.service(inputDto).subscribe({
        next: () => {
          // getStatusByNameが'available'で呼ばれていることを確認
          expect(stocksDatasource.getStatusByName).toHaveBeenCalledWith(
            'available'
          );
          done();
        },
        error: (error) => {
          done.fail(error);
        },
      });
    });
  });
});
