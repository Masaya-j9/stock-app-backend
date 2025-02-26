import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryListController } from '../controllers/category/category.controller';
import { CategoryListService } from '../../application/services/category/category.list.service';
import { DatabaseModule } from './database.module';
import { CategoriesDatasource } from '../../infrastructure/datasources/categories/categories.datasource';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([])],
  controllers: [CategoryListController],
  providers: [
    CategoriesDatasource,
    {
      provide: 'CategoryListServiceInterface',
      useClass: CategoryListService,
    },
  ],
  exports: [CategoriesDatasource, 'CategoryListServiceInterface'],
})
export class CategoriesModule {}
