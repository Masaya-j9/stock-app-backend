import { Observable } from 'rxjs';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { StockRegisterOutputDto } from '../../../dto/output/stock/stock.register.output.dto';
import { ApplicationEventHandler } from '../../application.event.handler';

export interface StockCreatedEventSubscriberInterface
  extends ApplicationEventHandler<ItemCreatedEvent, StockRegisterOutputDto> {
  handle(event: ItemCreatedEvent): Observable<StockRegisterOutputDto>;
}
