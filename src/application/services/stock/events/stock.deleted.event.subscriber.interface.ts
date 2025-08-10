import { ItemDeletedEvent } from '../../item/events/item.deleted.event.publisher.interface';
import { ApplicationEventHandler } from '../../application.event.handler';
import { Observable } from 'rxjs';

export interface StockDeletedEventSubscriberInterface
  extends ApplicationEventHandler<ItemDeletedEvent, void> {
  handle(event: ItemDeletedEvent): Observable<void>;
}
