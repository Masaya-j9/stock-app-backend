import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Observable, of } from 'rxjs';
import { ItemCreatedEvent } from '../../publisher/items/item-created.publisher';

@Injectable()
export class ItemCreatedSubscriber {
  private readonly logger = new Logger(ItemCreatedSubscriber.name);

  // constructor(private readonly stockService: StockService) {}
  // ↑在庫更新サービスをDIする場合はコメントアウトを外してください

  @RabbitSubscribe({
    exchange: 'item_exchange',
    routingKey: 'item.created',
    queue: 'item_created_queue',
  })
  public handleItemCreatedEvent(msg: ItemCreatedEvent): Observable<void> {
    this.logger.log(`受信: item.created: ${JSON.stringify(msg)}`);
    // 非同期副作用例: 在庫更新サービス呼び出し
    // return from(this.stockService.updateStockQuantity(msg.itemId, msg.quantity)).pipe(
    //   map(() => {
    //     this.logger.log('在庫更新完了');
    //   }),
    //   catchError((err) => {
    //     this.logger.error('在庫更新時にエラー', err);
    //     throw err;
    //   })
    // );
    // 今は単純なObservableで返す例:
    return of(undefined);
  }
}
