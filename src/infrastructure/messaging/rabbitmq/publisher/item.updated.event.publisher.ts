import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ItemUpdatedEvent,
  ItemUpdatedEventPublisherInterface,
} from '../../../../application/services/item/events/item.updated.event.publisher.interface';

@Injectable()
export class RabbitMQItemUpdatedEventPublisher
  implements ItemUpdatedEventPublisherInterface
{
  constructor(private readonly amqpConnection: AmqpConnection) {}

  //在庫情報をすべて更新
  publishItemUpdatedEvent(event: ItemUpdatedEvent): Observable<void> {
    return from(
      this.amqpConnection.publish('stock.exchange', 'item.updated', event)
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        throw new Error(
          `Failed to publish item updated event: ${error.message}`
        );
      })
    );
  }
}
