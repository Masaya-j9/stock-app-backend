import { Module } from '@nestjs/common';
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
  ],
  exports: [StocksDatasource, ItemsDatasource],
})
export class StocksModule {}
