import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemListController } from '../controllers/item/item.controller';
import { ItemListService } from '../../application/services/item/item.list.service';
import { DatabaseModule } from './database.module';
import { ItemListDatasource } from 'src/infrastructure/datasources/items/item.list.datasource';
import { CategoriesDatasource } from 'src/infrastructure/datasources/categories/categories.datasource';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([])],
  controllers: [ItemListController],
  providers: [
    ItemListDatasource,
    CategoriesDatasource,
    {
      provide: 'ItemListServiceInterface',
      useClass: ItemListService,
    },
  ],
})
export class ItemsModule {}
