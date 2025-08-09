import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ItemRestoreEvent,
  ItemRestoreEventPublisherInterface,
} from '../../../../application/services/item/events/item.restore.event.publisher.interface';

@Injectable()
export class RabbitMQItemRestoreEventPublisher
  implements ItemRestoreEventPublisherInterface
{
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishItemRestoreEvent(event: ItemRestoreEvent): Observable<void> {
    return from(
      this.amqpConnection.publish('stock.exchange', 'item.restored', event)
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        throw new Error(
          `Failed to publish item restore event: ${error.message}`
        );
      })
    );
  }
}
