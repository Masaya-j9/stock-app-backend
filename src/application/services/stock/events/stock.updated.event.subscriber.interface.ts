import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';
import { ApplicationEventHandler } from '../../application.event.handler';
import { Observable } from 'rxjs';

export interface StockUpdatedEventSubscriberInterface
  extends ApplicationEventHandler<ItemUpdatedEvent, void> {
  handle(event: ItemUpdatedEvent): Observable<void>;
}
