import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockRestoredEventSubscriberService } from './stock.restored.event.subscriber.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemRestoreEvent } from '../../item/events/item.restore.event.publisher.interface';

describe('StockRestoredEventSubscriberService', () => {
  let service: StockRestoredEventSubscriberService;
  let stocksDatasource: StocksDatasourceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockRestoredEventSubscriberService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: {
            restoreStockByItemId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockRestoredEventSubscriberService>(
      StockRestoredEventSubscriberService
    );
    stocksDatasource = module.get<StocksDatasourceInterface>(
      STOCKS_DATASOURCE_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemRestoreEvent を受け取り、在庫を復元して完了する(正常系)', (done) => {
      const event: ItemRestoreEvent = {
        id: 30,
        name: 'Item 30',
        quantity: 12,
        description: 'restore',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        categoryIds: [1],
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'restoreStockByItemId')
        .mockReturnValue(of(void 0));

      service.handle(event).subscribe({
        next: (value) => {
          expect(stocksDatasource.restoreStockByItemId).toHaveBeenCalledWith(
            event.id,
            event.quantity
          );
          expect(value).toBeUndefined();
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock restore for item ID: ${event.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Stock restored for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('在庫復元でエラーが発生した場合、エラーログを出力してエラーで終わる(異常系)', (done) => {
      const event: ItemRestoreEvent = {
        id: 31,
        name: 'Item 31',
        quantity: 1,
        description: 'restore2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        categoryIds: [2],
      };

      const error = new Error('DB error');

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});
      const errorSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'restoreStockByItemId')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(stocksDatasource.restoreStockByItemId).toHaveBeenCalledWith(
            event.id,
            event.quantity
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock restore for item ID: ${event.id}`
          );
          expect(errorSpy).toHaveBeenCalled();
          expect(errorSpy.mock.calls[0][0] as string).toContain(
            `Failed to restore stock for item ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
