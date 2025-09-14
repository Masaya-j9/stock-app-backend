import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StockRegisterServiceInterface } from '../stock.register.service.interface';
import { ItemCreatedEvent } from '../../item/events/item.created.event.publisher.interface';
import { StockCreatedEventSubscriberInterface } from './stock.created.event.subscriber.interface';
import { StockRegisterOutputDto } from '../../../dto/output/stock/stock.register.output.dto';
import { StockRegisterInputDto } from '../../../dto/input/stock/stock.register.input.dto';
import { EVENT_SOURCES } from '../constants/event.sources';

@Injectable()
export class StockCreatedEventSubscriberService
  implements StockCreatedEventSubscriberInterface
{
  private readonly logger = new Logger(StockCreatedEventSubscriberService.name);

  constructor(
    @Inject('StockRegisterServiceInterface')
    private readonly stockRegisterService: StockRegisterServiceInterface
  ) {}

  handle(event: ItemCreatedEvent): Observable<StockRegisterOutputDto> {
    this.logger.log(`Handling stock create event for item ID: ${event.id}`);

    // EventをInput DTOに変換
    const inputDto = new StockRegisterInputDto();
    inputDto.id = event.id;
    inputDto.name = event.name;
    inputDto.quantity = event.quantity;
    inputDto.description = event.description;
    inputDto.createdAt = event.createdAt;
    inputDto.updatedAt = event.updatedAt;
    inputDto.categoryIds = event.categoryIds;
    inputDto.eventSource = EVENT_SOURCES.ITEM_CREATED;

    return this.stockRegisterService.service(inputDto);
  }
}
