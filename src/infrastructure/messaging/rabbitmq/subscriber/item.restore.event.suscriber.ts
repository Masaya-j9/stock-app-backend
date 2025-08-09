import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Observable, tap } from 'rxjs';
import { StocksDatasource } from '../../../datasources/stocks/stocks.datasource';
import { ItemRestoreEvent } from '../../../../application/services/item/events/item.restore.event.publisher.interface';

@Injectable()
export class ItemRestoreEventSubscriber {
  private readonly logger = new Logger(ItemRestoreEventSubscriber.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.restored',
    queue: 'stock.item.restored.queue',
  })
  handleItemRestored(event: ItemRestoreEvent): Observable<void> {
    this.logger.log(`Received item restored event for item ID: ${event.id}`);

    return this.stocksDatasource
      .restoreStockByItemId(event.id, event.quantity)
      .pipe(
        tap({
          next: () =>
            this.logger.log(
              `Successfully updated stock for restored item ID: ${event.id}`
            ),
          error: (error) =>
            this.logger.error(
              `Error updating stock for restored item ID: ${event.id}`,
              error
            ),
        })
      );
  }
}
