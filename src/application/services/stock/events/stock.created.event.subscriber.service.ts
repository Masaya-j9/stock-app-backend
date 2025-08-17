import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable, tap, map } from 'rxjs';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { StockCreatedEventSubscriberInterface } from './stock.created.event.subscriber.interface';

@Injectable()
export class StockCreatedEventSubscriberService
  implements StockCreatedEventSubscriberInterface
{
  private readonly logger = new Logger(StockCreatedEventSubscriberService.name);

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    private readonly stocksDatasource: StocksDatasourceInterface
  ) {}

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
