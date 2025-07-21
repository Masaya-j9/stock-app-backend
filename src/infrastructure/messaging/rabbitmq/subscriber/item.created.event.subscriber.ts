import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { StocksDatasource } from '../../../datasources/stocks/stocks.datasource';
import { ItemCreatedEvent } from '../../../../application/services/item/events/item.created.event.publisher.interface';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ItemCreatedEventSubscriber {
  private readonly logger = new Logger(ItemCreatedEventSubscriber.name);

  constructor(private readonly stocksDatasource: StocksDatasource) {}

  @RabbitSubscribe({
    exchange: 'stock.exchange',
    routingKey: 'item.created',
    queue: 'stock.update.queue',
  })
  public async handleItemCreated(event: ItemCreatedEvent): Promise<void> {
    this.logger.log(`Received item created event for item ID: ${event.id}`);

    // RxJSのObservableを使用して在庫更新を実行
    await firstValueFrom(
      this.stocksDatasource
        .updateStockQuantityByItemId(
          event.id,
          event.quantity,
          event.description
        )
        .pipe(
          catchError((error) => {
            this.logger.error(
              `Failed to update stock for item ${event.id}: ${error.message}`
            );
            // エラーを再スローしてRabbitMQに失敗を通知
            throw error;
          })
        )
    );

    this.logger.log(`Successfully updated stock for item ID: ${event.id}`);
  }
}
