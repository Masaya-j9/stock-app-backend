import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { StockQuantityUpdatedEventSubscriberInterface } from './stock.quantity.updated.event.subscriber.interface';
import { ItemQuantityUpdatedEvent } from '../../item/events/item.quantity.updated.event.publisher.interface';

@Injectable()
export class StockQuantityUpdatedEventSubscriberService
  implements StockQuantityUpdatedEventSubscriberInterface
{
  private readonly logger = new Logger(
    StockQuantityUpdatedEventSubscriberService.name
  );

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    private readonly stocksDatasource: StocksDatasourceInterface
  ) {}

  handle(event: ItemQuantityUpdatedEvent): Observable<void> {
    this.logger.log(`Handling stock quantity update for item ID: ${event.id}`);
    return this.stocksDatasource
      .updateStockQuantityOnlyById(event.id, event.quantity)
      .pipe(
        tap({
          next: () =>
            this.logger.log(`Stock quantity updated for item ID: ${event.id}`),
          error: (error) =>
            this.logger.error(
              `Failed to update stock quantity for item ${event.id}: ${error.message}`
            ),
        }),
        map(() => void 0)
      );
  }
}
