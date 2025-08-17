import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemRestoreEvent } from '../../item/events/item.restore.event.publisher.interface';
import { StockRestoredEventSubscriberInterface } from './stock.restored.event.subscriber.interface';

@Injectable()
export class StockRestoredEventSubscriberService
  implements StockRestoredEventSubscriberInterface
{
  private readonly logger = new Logger(
    StockRestoredEventSubscriberService.name
  );

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    private readonly stocksDatasource: StocksDatasourceInterface
  ) {}

  handle(event: ItemRestoreEvent): Observable<void> {
    this.logger.log(`Handling stock restore for item ID: ${event.id}`);
    return this.stocksDatasource
      .restoreStockByItemId(event.id, event.quantity)
      .pipe(
        tap({
          next: () =>
            this.logger.log(`Stock restored for item ID: ${event.id}`),
          error: (error) =>
            this.logger.error(
              `Failed to restore stock for item ${event.id}: ${error.message}`
            ),
        })
      );
  }
}
