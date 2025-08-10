import { Injectable, Logger } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import { StocksDatasource } from '../../../../infrastructure/datasources/stocks/stocks.datasource';
import { StockQuantityUpdatedEventSubscriberInterface } from './stock.quantity.updated.event.subscriber.interface';
import { ItemQuantityUpdatedEvent } from '../../item/events/item.quantity.updated.event.publisher.interface';

@Injectable()
export class StockQuantityUpdatedEventSubscriberService
  implements StockQuantityUpdatedEventSubscriberInterface
{
  private readonly logger = new Logger(
    StockQuantityUpdatedEventSubscriberService.name
  );

  constructor(private readonly stocksDatasource: StocksDatasource) {}

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
