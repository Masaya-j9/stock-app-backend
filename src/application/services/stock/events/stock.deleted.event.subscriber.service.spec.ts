import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockDeletedEventSubscriberService } from './stock.deleted.event.subscriber.service';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemDeletedEvent } from '../../item/events/item.deleted.event.publisher.interface';

describe('StockDeletedEventSubscriberService', () => {
  let service: StockDeletedEventSubscriberService;
  let stocksDatasource: StocksDatasourceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockDeletedEventSubscriberService,
        {
          provide: STOCKS_DATASOURCE_TOKEN,
          useValue: {
            deletedByItemId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockDeletedEventSubscriberService>(
      StockDeletedEventSubscriberService
    );
    stocksDatasource = module.get<StocksDatasourceInterface>(
      STOCKS_DATASOURCE_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemDeletedEvent を受け取り、在庫を論理削除して完了する(正常系)', (done) => {
      const event: ItemDeletedEvent = {
        id: 20,
        name: 'Item 20',
        quantity: 0,
        description: 'deleted',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        categoryIds: [1],
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stocksDatasource, 'deletedByItemId')
        .mockReturnValue(of(void 0));

      service.handle(event).subscribe({
        next: (value) => {
          expect(stocksDatasource.deletedByItemId).toHaveBeenCalledWith(
            event.id
          );
          expect(value).toBeUndefined();
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock delete for item ID: ${event.id}`
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Stock marked deleted for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('在庫の論理削除でエラーが発生した場合、エラーログを出力してエラーで終わる(異常系)', (done) => {
      const event: ItemDeletedEvent = {
        id: 21,
        name: 'Item 21',
        quantity: 0,
        description: 'deleted2',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
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
        .spyOn(stocksDatasource, 'deletedByItemId')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(stocksDatasource.deletedByItemId).toHaveBeenCalledWith(
            event.id
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock delete for item ID: ${event.id}`
          );

          expect(errorSpy).toHaveBeenCalled();
          expect(errorSpy.mock.calls[0][0] as string).toContain(
            `Failed to mark stock deleted for item ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
