import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemDeletedEvent } from '../../item/events/item.deleted.event.publisher.interface';
import { StockDeletedEventSubscriberInterface } from './stock.deleted.event.subscriber.interface';

@Injectable()
export class StockDeletedEventSubscriberService
  implements StockDeletedEventSubscriberInterface
{
  private readonly logger = new Logger(StockDeletedEventSubscriberService.name);

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    private readonly stocksDatasource: StocksDatasourceInterface
  ) {}

  handle(event: ItemDeletedEvent): Observable<void> {
    this.logger.log(`Handling stock delete for item ID: ${event.id}`);
    return this.stocksDatasource.deletedByItemId(event.id).pipe(
      tap({
        next: () =>
          this.logger.log(`Stock marked deleted for item ID: ${event.id}`),
        error: (error) =>
          this.logger.error(
            `Failed to mark stock deleted for item ${event.id}: ${error.message}`
          ),
      })
    );
  }
}
