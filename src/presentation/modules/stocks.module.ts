import { Module } from '@nestjs/common';
import { StockUpdatedEventSubscriberService } from '../../application/services/stock/events/stock.updated.event.subscriber.service';
import { StockDeletedEventSubscriberService } from '../../application/services/stock/events/stock.deleted.event.subscriber.service';
import { StockRestoredEventSubscriberService } from '../../application/services/stock/events/stock.restored.event.subscriber.service';
import { StockQuantityUpdatedEventSubscriberService } from '../../application/services/stock/events/stock.quantity.updated.event.subscriber.service';
import { StockCreatedEventSubscriberService } from '../../application/services/stock/events/stock.created.event.subscriber.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stocks } from '../../infrastructure/orm/entities/stocks.entity';
import { Items } from '../../infrastructure/orm/entities/items.entity';
import { StocksDatasource } from '../../infrastructure/datasources/stocks/stocks.datasource';
import { ItemsDatasource } from '../../infrastructure/datasources/items/items.datasource';
import { StockListService } from '../../application/services/stock/stock.list.service';
import { StockController } from '../controllers/stock/stock.controller';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Stocks, Items])],
  controllers: [StockController],
  providers: [
    StocksDatasource,
    ItemsDatasource,
    {
      provide: 'StockListServiceInterface',
      useClass: StockListService,
    },
    {
      provide: 'StockQuantityUpdatedEventSubscriberInterface',
      useClass: StockQuantityUpdatedEventSubscriberService,
    },
    {
      provide: 'StockCreatedEventSubscriberInterface',
      useClass: StockCreatedEventSubscriberService,
    },
    {
      provide: 'StockUpdatedEventSubscriberInterface',
      useClass: StockUpdatedEventSubscriberService,
    },
    {
      provide: 'StockDeletedEventSubscriberInterface',
      useClass: StockDeletedEventSubscriberService,
    },
    {
      provide: 'StockRestoredEventSubscriberInterface',
      useClass: StockRestoredEventSubscriberService,
    },
  ],
  exports: [
    StocksDatasource,
    ItemsDatasource,
    'StockCreatedEventSubscriberInterface',
    'StockUpdatedEventSubscriberInterface',
    'StockDeletedEventSubscriberInterface',
    'StockRestoredEventSubscriberInterface',
    'StockQuantityUpdatedEventSubscriberInterface',
  ],
})
export class StocksModule {}
