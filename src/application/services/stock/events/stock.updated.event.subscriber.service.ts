import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';
import { StockUpdatedEventSubscriberInterface } from './stock.updated.event.subscriber.interface';

@Injectable()
export class StockUpdatedEventSubscriberService
  implements StockUpdatedEventSubscriberInterface
{
  private readonly logger = new Logger(StockUpdatedEventSubscriberService.name);

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    private readonly stocksDatasource: StocksDatasourceInterface
  ) {}

  handle(event: ItemUpdatedEvent): Observable<void> {
    this.logger.log(`Handling stock update for item ID: ${event.id}`);
    return this.stocksDatasource
      .updateStockQuantityByItemId(event.id, event.quantity, event.description)
      .pipe(
        tap({
          next: () => this.logger.log(`Stock updated for item ID: ${event.id}`),
          error: (error) =>
            this.logger.error(
              `Failed to update stock for item ${event.id}: ${error.message}`
            ),
        }),
        map(() => void 0)
      );
  }
}
