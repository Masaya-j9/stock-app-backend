import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ItemQuantityUpdatedEvent,
  ItemQuantityUpdatedEventPublisherInterface,
} from '../../../../application/services/item/events/item.quantity.updated.event.publisher.interface';

@Injectable()
export class RabbitMQItemQuantityUpdatedEventPublisher
  implements ItemQuantityUpdatedEventPublisherInterface
{
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishItemQuantityUpdatedEvent(
    event: ItemQuantityUpdatedEvent
  ): Observable<void> {
    return from(
      this.amqpConnection.publish(
        'stock.exchange',
        'item.quantity.updated',
        event
      )
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        throw new Error(
          `Failed to publish item quantity updated event: ${error.message}`
        );
      })
    );
  }
}
