import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ItemCreatedEvent } from '../../../../application/services/item/events/item.created.event.publisher.interface';
import { Observable } from 'rxjs';
import { Inject } from '@nestjs/common';
import { StockCreatedEventSubscriberInterface } from '../../../../application/services/stock/events/stock.created.event.subscriber.interface';

@Injectable()
export class ItemCreatedEventSubscriber {
  private readonly logger = new Logger(ItemCreatedEventSubscriber.name);

  constructor(
    @Inject('StockCreatedEventSubscriberInterface')
    private readonly stockCreatedHandler: StockCreatedEventSubscriberInterface
  ) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.created',
    queue: 'stock.created.queue',
  })
  public handleItemCreated(event: ItemCreatedEvent): Observable<void> {
    this.logger.log(`Received item created event for item ID: ${event.id}`);
    return this.stockCreatedHandler.handle(event);
  }
}
