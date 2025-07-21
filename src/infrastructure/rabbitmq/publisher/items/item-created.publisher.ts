import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Observable, from } from 'rxjs';

export type ItemCreatedEvent = {
  itemId: number;
  name: string;
  quantity: number;
};

@Injectable()
export class ItemCreatedPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishItemCreatedEvent(event: ItemCreatedEvent): Observable<boolean> {
    return from(
      this.amqpConnection.publish(
        'item_exchange', // Exchange名（プロジェクトに合わせて変更可）
        'item.created', // RoutingKey
        event
      )
    );
  }
}
