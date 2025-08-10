import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Observable, tap } from 'rxjs';
import { ItemDeletedEvent } from '../../../../application/services/item/events/item.deleted.event.publisher.interface';
import { Inject } from '@nestjs/common';
import { StockDeletedEventSubscriberInterface } from '../../../../application/services/stock/events/stock.deleted.event.subscriber.interface';

@Injectable()
export class ItemDeletedEventSubscriber {
  private readonly logger = new Logger(ItemDeletedEventSubscriber.name);

  constructor(
    @Inject('StockDeletedEventSubscriberInterface')
    private readonly stockDeletedHandler: StockDeletedEventSubscriberInterface
  ) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'stock.item.deleted',
    queue: 'stock.item.deleted.queue',
  })
  handleItemDeleted(event: ItemDeletedEvent): Observable<void> {
    this.logger.log(`Received item deleted event for item ID: ${event.id}`);

    return this.stockDeletedHandler.handle(event).pipe(
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
