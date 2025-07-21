import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ItemUpdatedEvent } from '../../../../application/services/item/events/item.updated.event.publisher.interface';
import { StocksDatasource } from '../../../datasources/stocks/stocks.datasource';
import { Observable, map, catchError, throwError } from 'rxjs';

@Injectable()
export class ItemUpdatedEventSubscriber {
  private readonly logger = new Logger(ItemUpdatedEventSubscriber.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.updated',
    queue: 'stock.quantity.update_queue',
  })
  handleItemUpdated(event: ItemUpdatedEvent): Observable<void> {
    this.logger.log(`Received item updated event for item ID: ${event.id}`);

    return this.stocksDatasource
      .updateStockQuantityByItemId(event.id, event.quantity, event.description)
      .pipe(
        map(() => {
          this.logger.log(
            `Successfully updated stock for item ID: ${event.id}`
          );
        }),
        catchError((error) => {
          this.logger.error(
            `Failed to update stock for item ${event.id}: ${error.message}`
          );
          return throwError(() => error);
        })
      );
  }
}
