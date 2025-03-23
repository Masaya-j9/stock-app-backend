import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from '../controllers/item/item.controller';
import { ItemListService } from '../../application/services/item/item.list.service';
import { DatabaseModule } from './database.module';
import { ItemsDatasource } from 'src/infrastructure/datasources/items/items.datasource';
import { CategoriesModule } from './categories.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([]), CategoriesModule],
  controllers: [ItemController],
  providers: [
    ItemsDatasource,
    {
      provide: 'ItemListServiceInterface',
      useClass: ItemListService,
    },
  ],
})
export class ItemsModule {}
