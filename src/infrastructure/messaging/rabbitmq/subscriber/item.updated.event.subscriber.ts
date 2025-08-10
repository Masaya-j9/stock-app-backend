import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ItemUpdatedEvent } from '../../../../application/services/item/events/item.updated.event.publisher.interface';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Inject } from '@nestjs/common';
import { StockUpdatedEventSubscriberInterface } from '../../../../application/services/stock/events/stock.updated.event.subscriber.interface';

@Injectable()
export class ItemUpdatedEventSubscriber {
  private readonly logger = new Logger(ItemUpdatedEventSubscriber.name);

  constructor(
    @Inject('StockUpdatedEventSubscriberInterface')
    private readonly stockUpdatedHandler: StockUpdatedEventSubscriberInterface
  ) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.updated',
    queue: 'stock.quantity.update_queue',
  })
  handleItemUpdated(event: ItemUpdatedEvent): Observable<void> {
    this.logger.log(`Received item updated event for item ID: ${event.id}`);

    return this.stockUpdatedHandler.handle(event).pipe(
      map(() => {
        this.logger.log(`Successfully updated stock for item ID: ${event.id}`);
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
