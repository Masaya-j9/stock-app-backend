import { Observable } from 'rxjs';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { ApplicationEventHandler } from '../../application.event.handler';

export interface StockCreatedEventSubscriberInterface
  extends ApplicationEventHandler<ItemCreatedEvent, void> {
  handle(event: ItemCreatedEvent): Observable<void>;
}
