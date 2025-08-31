import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { StockCreatedEventSubscriberService } from './stock.created.event.subscriber.service';
import { StockRegisterServiceInterface } from '../stock.register.interface';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { StockRegisterOutputDto } from '../../../dto/output/stock/stock.register.output.dto';

describe('StockCreatedEventSubscriberService', () => {
  let service: StockCreatedEventSubscriberService;
  let stockRegisterService: StockRegisterServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockCreatedEventSubscriberService,
        {
          provide: 'StockRegisterServiceInterface',
          useValue: {
            service: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockCreatedEventSubscriberService>(
      StockCreatedEventSubscriberService
    );
    stockRegisterService = module.get<StockRegisterServiceInterface>(
      'StockRegisterServiceInterface'
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('イベントデータを使ってserviceを呼び出すこと', () => {
      const mockEvent: ItemCreatedEvent = {
        id: 1,
        name: 'Test Item',
        quantity: 10,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [1, 2],
      };

      const mockOutput: StockRegisterOutputDto = {
        id: 'uuid-123',
        quantity: 10,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        item: {
          id: 1,
          name: 'Test Item',
        },
        status: {
          id: 1,
          name: 'Available',
          description: 'Stock is available',
        },
      };

      const registerStockSpy = jest
        .spyOn(stockRegisterService, 'service')
        .mockReturnValue(of(mockOutput));

      service.handle(mockEvent);

      expect(registerStockSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'Test Item',
          quantity: 10,
          description: 'Test Description',
          categoryIds: [1, 2],
          eventSource: 'item.created',
        })
      );
    });

    it('serviceからのエラーを適切に処理すること', () => {
      const mockEvent: ItemCreatedEvent = {
        id: 2,
        name: 'Test Item 2',
        quantity: 5,
        description: 'Test Description 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [3],
      };

      const registerStockSpy = jest
        .spyOn(stockRegisterService, 'service')
        .mockReturnValue(throwError('Error occurred'));

      service.handle(mockEvent);

      expect(registerStockSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          name: 'Test Item 2',
          quantity: 5,
          description: 'Test Description 2',
          categoryIds: [3],
          eventSource: 'item.created',
        })
      );
    });
  });
});
