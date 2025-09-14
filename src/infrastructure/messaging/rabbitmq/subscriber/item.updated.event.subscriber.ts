import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ItemUpdatedEvent } from '../../../../application/services/item/events/item.updated.event.publisher.interface';
import { Observable, map } from 'rxjs';
import { Inject } from '@nestjs/common';
import { StockUpdateEventSubscriberInterface } from '../../../../application/services/stock/events/stock.updated.event.subscriber.interface';

@Injectable()
export class ItemUpdatedEventSubscriber {
  private readonly logger = new Logger(ItemUpdatedEventSubscriber.name);

  constructor(
    @Inject('StockUpdateEventSubscriberInterface')
    private readonly stockUpdatedHandler: StockUpdateEventSubscriberInterface
  ) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.updated',
    queue: 'stock.quantity.update_queue',
  })
  public handleItemUpdate(event: ItemUpdatedEvent): Observable<void> {
    this.logger.log(`Received item updated event for item ID: ${event.id}`);
    return this.stockUpdatedHandler.handle(event).pipe(map(() => void 0));
  }
}
