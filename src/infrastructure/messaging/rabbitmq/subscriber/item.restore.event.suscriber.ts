import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Observable, tap } from 'rxjs';
import { ItemRestoreEvent } from '../../../../application/services/item/events/item.restore.event.publisher.interface';
import { Inject } from '@nestjs/common';
import { StockRestoredEventSubscriberInterface } from '../../../../application/services/stock/events/stock.restored.event.subscriber.interface';

@Injectable()
export class ItemRestoreEventSubscriber {
  private readonly logger = new Logger(ItemRestoreEventSubscriber.name);

  constructor(
    @Inject('StockRestoredEventSubscriberInterface')
    private readonly stockRestoredHandler: StockRestoredEventSubscriberInterface
  ) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.restored',
    queue: 'stock.item.restored.queue',
  })
  handleItemRestored(event: ItemRestoreEvent): Observable<void> {
    this.logger.log(`Received item restored event for item ID: ${event.id}`);

    return this.stockRestoredHandler.handle(event).pipe(
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
