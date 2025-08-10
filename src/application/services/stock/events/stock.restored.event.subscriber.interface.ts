import { ItemRestoreEvent } from '../../item/events/item.restore.event.publisher.interface';
import { ApplicationEventHandler } from '../../application.event.handler';
import { Observable } from 'rxjs';

export interface StockRestoredEventSubscriberInterface
  extends ApplicationEventHandler<ItemRestoreEvent, void> {
  handle(event: ItemRestoreEvent): Observable<void>;
}
