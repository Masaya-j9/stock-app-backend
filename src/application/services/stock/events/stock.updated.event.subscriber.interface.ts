import { Observable } from 'rxjs';
import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';
import { StockUpdateOutputDto } from '../../../dto/output/stock/stock.update.output.dto';
import { ApplicationEventHandler } from '../../application.event.handler';

export interface StockUpdateEventSubscriberInterface
  extends ApplicationEventHandler<ItemUpdatedEvent, StockUpdateOutputDto> {
  handle(event: ItemUpdatedEvent): Observable<StockUpdateOutputDto>;
}
