import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockUpdatedEventSubscriberService } from './stock.updated.event.subscriber.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';

describe('StockUpdatedEventSubscriberService', () => {
  let service: StockUpdatedEventSubscriberService;
  let stocksDatasource: StocksDatasourceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockUpdatedEventSubscriberService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: {
            updateStockQuantityByItemId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockUpdatedEventSubscriberService>(
      StockUpdatedEventSubscriberService
    );
    stocksDatasource = module.get<StocksDatasourceInterface>(
      STOCKS_DATASOURCE_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemUpdatedEvent を受け取り、在庫を更新して完了する(正常系)', (done) => {
      const event: ItemUpdatedEvent = {
        id: 10,
        name: 'Item 10',
        quantity: 7,
        description: 'updated',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [1],
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'updateStockQuantityByItemId')
        .mockReturnValue(of(void 0));

      service.handle(event).subscribe({
        next: (value) => {
          expect(
            stocksDatasource.updateStockQuantityByItemId
          ).toHaveBeenCalledWith(event.id, event.quantity, event.description);
          expect(value).toBeUndefined();
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock update for item ID: ${event.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Stock updated for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('在庫更新でエラーが発生した場合、エラーログを出力してエラーで終わる(異常系)', (done) => {
      const event: ItemUpdatedEvent = {
        id: 11,
        name: 'Item 11',
        quantity: 3,
        description: 'updated2',
        createdAt: new Date(),
        updatedAt: new Date(),
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
        .spyOn(stocksDatasource, 'updateStockQuantityByItemId')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(
            stocksDatasource.updateStockQuantityByItemId
          ).toHaveBeenCalledWith(event.id, event.quantity, event.description);
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock update for item ID: ${event.id}`
          );
          expect(errorSpy).toHaveBeenCalled();
          expect(errorSpy.mock.calls[0][0] as string).toContain(
            `Failed to update stock for item ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
