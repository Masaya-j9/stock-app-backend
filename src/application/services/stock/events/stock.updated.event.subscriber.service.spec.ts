import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockUpdatedEventSubscriberService } from './stock.updated.event.subscriber.service';
import { StockUpdateServiceInterface } from '../stock.update.service.interface';
import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';
import { StockUpdateOutputDto } from '../../../dto/output/stock/stock.update.output.dto';
import { EVENT_SOURCES } from '../constants/event.sources';

describe('StockUpdatedEventSubscriberService', () => {
  let service: StockUpdatedEventSubscriberService;
  let stockUpdateService: StockUpdateServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockUpdatedEventSubscriberService,
        {
          provide: 'StockUpdateServiceInterface',
          useValue: {
            service: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockUpdatedEventSubscriberService>(
      StockUpdatedEventSubscriberService
    );
    stockUpdateService = module.get<StockUpdateServiceInterface>(
      'StockUpdateServiceInterface'
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('ItemUpdatedEvent を受け取り、StockUpdateServiceを呼び出して完了する(正常系)', (done) => {
      const event: ItemUpdatedEvent = {
        id: 10,
        name: 'Item 10',
        quantity: 7,
        description: 'updated',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [1],
      };

      const expectedOutput: StockUpdateOutputDto = {
        id: 1,
        quantity: 7,
        description: 'updated',
        createdAt: new Date(),
        updatedAt: new Date(),
        item: {
          id: 10,
          name: 'Item 10',
        },
        status: {
          id: 1,
          name: 'available',
          description: 'Available status',
        },
      };

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stockUpdateService, 'service')
        .mockReturnValue(of(expectedOutput));

      service.handle(event).subscribe({
        next: (result) => {
          // StockUpdateInputDtoが正しく作成されていることを確認
          expect(stockUpdateService.service).toHaveBeenCalledWith(
            expect.objectContaining({
              id: event.id,
              name: event.name,
              quantity: event.quantity,
              description: event.description,
              updatedAt: event.updatedAt,
              categoryIds: event.categoryIds,
              eventSource: EVENT_SOURCES.ITEM_UPDATED,
            })
          );
          expect(result).toEqual(expectedOutput);
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock update event for item ID: ${event.id}`
          );
        },
        error: (error) => done.fail(error),
        complete: () => done(),
      });
    });

    it('StockUpdateServiceでエラーが発生した場合、エラーが伝播される(異常系)', (done) => {
      const event: ItemUpdatedEvent = {
        id: 11,
        name: 'Item 11',
        quantity: 3,
        description: 'updated2',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [2],
      };

      const error = new Error('Stock update service error');

      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => {});

      jest
        .spyOn(stockUpdateService, 'service')
        .mockReturnValue(throwError(() => error));

      service.handle(event).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(stockUpdateService.service).toHaveBeenCalledWith(
            expect.objectContaining({
              id: event.id,
              name: event.name,
              quantity: event.quantity,
              description: event.description,
              updatedAt: event.updatedAt,
              categoryIds: event.categoryIds,
              eventSource: EVENT_SOURCES.ITEM_UPDATED,
            })
          );
          expect(logSpy).toHaveBeenCalledWith(
            `Handling stock update event for item ID: ${event.id}`
          );
          expect(err).toBe(error);
          done();
        },
        complete: () => done.fail('Expected error, but completed'),
      });
    });
  });
});
