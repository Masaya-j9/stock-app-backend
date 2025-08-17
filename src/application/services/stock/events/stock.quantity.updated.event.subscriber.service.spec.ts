import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockQuantityUpdatedEventSubscriberService } from './stock.quantity.updated.event.subscriber.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemQuantityUpdatedEvent } from '../../item/events/item.quantity.updated.event.publisher.interface';

describe('StockQuantityUpdatedEventSubscriberService', () => {
  let service: StockQuantityUpdatedEventSubscriberService;
  let stocksDatasource: StocksDatasourceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockQuantityUpdatedEventSubscriberService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: {
            updateStockQuantityOnlyById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockQuantityUpdatedEventSubscriberService>(
      StockQuantityUpdatedEventSubscriberService
    );
    stocksDatasource = module.get<StocksDatasourceInterface>(
      STOCKS_DATASOURCE_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemQuantityUpdatedEvent を受け取り、在庫数量を更新して完了する(正常系)', (done) => {
      const event: ItemQuantityUpdatedEvent = {
        id: 100,
        quantity: 99,
        updatedAt: new Date(),
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'updateStockQuantityOnlyById')
        .mockReturnValue(of(void 0));

      service.handle(event).subscribe({
        next: (value) => {
          expect(
            stocksDatasource.updateStockQuantityOnlyById
          ).toHaveBeenCalledWith(event.id, event.quantity);
          expect(value).toBeUndefined();
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock quantity update for item ID: ${event.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Stock quantity updated for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('在庫数量更新でエラーが発生した場合、エラーログを出力してエラーで終わる(異常系)', (done) => {
      const event: ItemQuantityUpdatedEvent = {
        id: 101,
        quantity: 1,
        updatedAt: new Date(),
      };

      const error = new Error('DB error');

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});
      const errorSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'updateStockQuantityOnlyById')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(
            stocksDatasource.updateStockQuantityOnlyById
          ).toHaveBeenCalledWith(event.id, event.quantity);
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock quantity update for item ID: ${event.id}`
          );
          expect(errorSpy).toHaveBeenCalled();
          expect(errorSpy.mock.calls[0][0] as string).toContain(
            `Failed to update stock quantity for item ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
