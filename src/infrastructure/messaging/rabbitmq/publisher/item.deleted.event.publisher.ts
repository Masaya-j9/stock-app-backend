import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable } from 'rxjs';
import {
  ItemDeletedEvent,
  ItemDeletedEventPublisherInterface,
} from '../../../../application/services/item/events/item.deleted.event.publisher.interface';

@Injectable()
export class RabbitMQItemDeletedEventPublisher
  implements ItemDeletedEventPublisherInterface
{
  private readonly logger = new Logger(RabbitMQItemDeletedEventPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishItemDeletedEvent(event: ItemDeletedEvent): Observable<void> {
    return new Observable((subscriber) => {
      this.amqpConnection
        .publish('stock.exchange', 'stock.item.deleted', event)
        .then(() => {
          this.logger.log(
            `Item deleted event published successfully for item ID: ${event.id}`
          );
          subscriber.next();
          subscriber.complete();
        })
        .catch((error) => {
          this.logger.error(
            `Failed to publish item deleted event for item ID: ${event.id}`,
            error
          );
          subscriber.error(error);
        });
    });
  }
}
