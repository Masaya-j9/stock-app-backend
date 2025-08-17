import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockCreatedEventSubscriberService } from './stock.created.event.subscriber.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';

describe('StockCreatedEventSubscriberService', () => {
  let service: StockCreatedEventSubscriberService;
  let stocksDatasource: StocksDatasourceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockCreatedEventSubscriberService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: {
            createStockQuantityByItemId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockCreatedEventSubscriberService>(
      StockCreatedEventSubscriberService
    );
    stocksDatasource = module.get<StocksDatasourceInterface>(
      STOCKS_DATASOURCE_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemCreatedEvent を受け取り、在庫作成/更新処理を実行して完了する(正常系)', (done) => {
      const event: ItemCreatedEvent = {
        id: 1,
        name: 'Item 1',
        quantity: 10,
        description: 'desc',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [1, 2],
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'createStockQuantityByItemId')
        .mockReturnValue(of({} as any));

      service.handle(event).subscribe({
        next: (value) => {
          expect(
            stocksDatasource.createStockQuantityByItemId
          ).toHaveBeenCalledWith(event.id, event.quantity, event.description);
          expect(value).toBeUndefined();
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock create for item ID: ${event.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Stock created/updated for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('在庫作成でエラーが発生した場合、エラーログを出力してエラーで終わる(異常系)', (done) => {
      const event: ItemCreatedEvent = {
        id: 2,
        name: 'Item 2',
        quantity: 5,
        description: 'desc2',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [3],
      };

      const error = new Error('DB error');

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});
      const errorSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'createStockQuantityByItemId')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(
            stocksDatasource.createStockQuantityByItemId
          ).toHaveBeenCalledWith(event.id, event.quantity, event.description);
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock create for item ID: ${event.id}`
          );
          expect(errorSpy).toHaveBeenCalled();
          expect(errorSpy.mock.calls[0][0] as string).toContain(
            `Failed to create/update stock for item ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
