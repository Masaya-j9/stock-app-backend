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
import { STOCKS_DATASOURCE_TOKEN } from '../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ITEMS_DATASOURCE_TOKEN } from '../../infrastructure/datasources/items/items.datasource.interface';
import { StockListService } from '../../application/services/stock/stock.list.service';
import { StockRegisterService } from '../../application/services/stock/stock.register.service';
import { StockUpdateService } from '../../application/services/stock/stock.update.service';
import { StockController } from '../controllers/stock/stock.controller';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Stocks, Items])],
  controllers: [StockController],
  providers: [
    {
      provide: STOCKS_DATASOURCE_TOKEN,
      useClass: StocksDatasource,
    },
    {
      provide: ITEMS_DATASOURCE_TOKEN,
      useClass: ItemsDatasource,
    },
    {
      provide: 'StockListServiceInterface',
      useClass: StockListService,
    },
    {
      provide: 'StockRegisterServiceInterface',
      useClass: StockRegisterService,
    },
    {
      provide: 'StockUpdateServiceInterface',
      useClass: StockUpdateService,
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
      provide: 'StockUpdateEventSubscriberInterface',
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
    STOCKS_DATASOURCE_TOKEN,
    ITEMS_DATASOURCE_TOKEN,
    'StockRegisterServiceInterface',
    'StockUpdateServiceInterface',
    'StockCreatedEventSubscriberInterface',
    'StockUpdateEventSubscriberInterface',
    'StockDeletedEventSubscriberInterface',
    'StockRestoredEventSubscriberInterface',
    'StockQuantityUpdatedEventSubscriberInterface',
  ],
})
export class StocksModule {}
