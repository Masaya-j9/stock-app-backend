import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Observable, tap } from 'rxjs';
import { StocksDatasource } from '../../../datasources/stocks/stocks.datasource';
import { ItemDeletedEvent } from '../../../../application/services/item/events/item.deleted.event.publisher.interface';

@Injectable()
export class ItemDeletedEventSubscriber {
  private readonly logger = new Logger(ItemDeletedEventSubscriber.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'stock.item.deleted',
    queue: 'stock.item.deleted.queue',
  })
  handleItemDeleted(event: ItemDeletedEvent): Observable<void> {
    this.logger.log(`Received item deleted event for item ID: ${event.id}`);

    return this.stocksDatasource.deletedByItemId(event.id).pipe(
      tap({
        next: () =>
          this.logger.log(
            `Successfully updated stock for deleted item ID: ${event.id}`
          ),
        error: (error) =>
          this.logger.error(
            `Error updating stock for deleted item ID: ${event.id}`,
            error
          ),
      })
    );
  }
}
