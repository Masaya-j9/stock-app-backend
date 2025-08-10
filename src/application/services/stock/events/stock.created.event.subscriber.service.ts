import { Injectable, Logger } from '@nestjs/common';
import { Observable, tap, map } from 'rxjs';
import { StocksDatasource } from '../../../../infrastructure/datasources/stocks/stocks.datasource';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { StockCreatedEventSubscriberInterface } from './stock.created.event.subscriber.interface';

@Injectable()
export class StockCreatedEventSubscriberService
  implements StockCreatedEventSubscriberInterface
{
  private readonly logger = new Logger(StockCreatedEventSubscriberService.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  handle(event: ItemCreatedEvent): Observable<void> {
    this.logger.log(`Handling stock create for item ID: ${event.id}`);
    return this.stocksDatasource
      .createStockQuantityByItemId(event.id, event.quantity, event.description)
      .pipe(
        tap({
          next: () =>
            this.logger.log(`Stock created/updated for item ID: ${event.id}`),
          error: (error) =>
            this.logger.error(
              `Failed to create/update stock for item ${event.id}: ${error.message}`
            ),
        }),
        map(() => void 0)
      );
  }
}
