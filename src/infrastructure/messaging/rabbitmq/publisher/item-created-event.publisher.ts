import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ItemCreatedEvent,
  ItemCreatedEventPublisherInterface,
} from '../../../../application/services/item/item-created-event.publisher.interface';

@Injectable()
export class RabbitMQItemCreatedEventPublisher
  implements ItemCreatedEventPublisherInterface
{
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishItemCreatedEvent(event: ItemCreatedEvent): Observable<void> {
    return from(
      this.amqpConnection.publish('stock.exchange', 'item.created', event)
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        throw new Error(
          `Failed to publish item created event: ${error.message}`
        );
      })
    );
  }
}
