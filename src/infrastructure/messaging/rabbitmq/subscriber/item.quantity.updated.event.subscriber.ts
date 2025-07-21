import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ItemQuantityUpdatedEvent } from '../../../../application/services/item/events/item.quantity.updated.event.publisher.interface';
import { StocksDatasource } from '../../../datasources/stocks/stocks.datasource';
import { Observable, map, catchError, throwError } from 'rxjs';

@Injectable()
export class ItemQuantityUpdatedEventSubscriber {
  private readonly logger = new Logger(ItemQuantityUpdatedEventSubscriber.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.quantity.updated',
    queue: 'stock.update.queue',
  })
  handleItemQuantityUpdated(event: ItemQuantityUpdatedEvent): Observable<void> {
    this.logger.log(
      `Received item quantity updated event for item ID: ${event.id}`
    );

    return this.stocksDatasource
      .updateStockQuantityOnlyById(event.id, event.quantity)
      .pipe(
        map(() => {
          this.logger.log(
            `Successfully updated stock quantity for item ID: ${event.id}`
          );
        }),
        catchError((error) => {
          this.logger.error(
            `Failed to update stock quantity for item ${event.id}: ${error.message}`
          );
          return throwError(() => error);
        })
      );
  }
}
