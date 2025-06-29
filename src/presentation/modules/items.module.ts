import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from '../controllers/item/item.controller';
import { ItemListService } from '../../application/services/item/item.list.service';
import { ItemRegisterService } from '../../application/services/item/item.register.service';
import { ItemUpdateService } from '../../application/services/item/item.update.service';
import { ItemDeleteService } from '../../application/services/item/item.delete.service';
import { ItemSingleService } from '../../application/services/item/item.single.service';
import { DeletedItemListService } from '../../application/services/item/deleted.item.list.service';
import { DeletedItemSingleService } from '../../application/services/item/deleted.item.single.service';
import { ItemRestoreService } from '../../application/services/item/item.restore.service';
import { DatabaseModule } from './database.module';
import { ItemsDatasource } from 'src/infrastructure/datasources/items/items.datasource';
import { CategoriesModule } from './categories.module';
import { RabbitMQModule } from './rabbitmq.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([]),
    CategoriesModule,
    RabbitMQModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemsDatasource,
    {
      provide: 'ItemListServiceInterface',
      useClass: ItemListService,
    },
    {
      provide: 'ItemRegisterServiceInterface',
      useClass: ItemRegisterService,
    },
    {
      provide: 'ItemUpdateServiceInterface',
      useClass: ItemUpdateService,
    },
    {
      provide: 'ItemDeleteServiceInterface',
      useClass: ItemDeleteService,
    },
    {
      provide: 'ItemSingleServiceInterface',
      useClass: ItemSingleService,
    },
    {
      provide: 'DeletedItemListServiceInterface',
      useClass: DeletedItemListService,
    },
    {
      provide: 'DeletedItemSingleServiceInterface',
      useClass: DeletedItemSingleService,
    },
    {
      provide: 'ItemRestoreServiceInterface',
      useClass: ItemRestoreService,
    },
  ],
})
export class ItemsModule {}
