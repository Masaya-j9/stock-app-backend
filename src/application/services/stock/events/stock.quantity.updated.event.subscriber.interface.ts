import { Observable } from 'rxjs';
import { ApplicationEventHandler } from '../../application.event.handler';
import { ItemQuantityUpdatedEvent } from '../../item/events/item.quantity.updated.event.publisher.interface';

export interface StockQuantityUpdatedEventSubscriberInterface
  extends ApplicationEventHandler<ItemQuantityUpdatedEvent, void> {
  handle(event: ItemQuantityUpdatedEvent): Observable<void>;
}
