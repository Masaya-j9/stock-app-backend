import { Injectable, Logger, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StockUpdateServiceInterface } from '../stock.update.service.interface';
import { ItemUpdatedEvent } from '../../item/events/item.updated.event.publisher.interface';
import { StockUpdateEventSubscriberInterface } from './stock.updated.event.subscriber.interface';
import { StockUpdateInputDto } from '../../../dto/input/stock/stock.update.input.dto';
import { StockUpdateOutputDto } from '../../../dto/output/stock/stock.update.output.dto';
import { EVENT_SOURCES } from '../constants/event.sources';

@Injectable()
export class StockUpdatedEventSubscriberService
  implements StockUpdateEventSubscriberInterface
{
  private readonly logger = new Logger(StockUpdatedEventSubscriberService.name);

  constructor(
    @Inject('StockUpdateServiceInterface')
    private readonly stockUpdateService: StockUpdateServiceInterface
  ) {}

  handle(event: ItemUpdatedEvent): Observable<StockUpdateOutputDto> {
    this.logger.log(`Handling stock update event for item ID: ${event.id}`);
    // EventをInput DTOに変換
    const inputDto = new StockUpdateInputDto();
    inputDto.id = event.id;
    inputDto.name = event.name;
    inputDto.quantity = event.quantity;
    inputDto.description = event.description;
    inputDto.updatedAt = event.updatedAt;
    inputDto.categoryIds = event.categoryIds;
    inputDto.eventSource = EVENT_SOURCES.ITEM_UPDATED;

    return this.stockUpdateService.service(inputDto);
  }
}
