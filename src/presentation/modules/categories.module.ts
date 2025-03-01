import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryListController } from '../controllers/category/category.controller';
import { CategoryListService } from '../../application/services/category/category.list.service';
import { CategoryRegisterService } from '../../application/services/category/category.register.service';
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
    {
      provide: 'CategoryRegisterServiceInterface',
      useClass: CategoryRegisterService,
    },
  ],
  exports: [
    CategoriesDatasource,
    'CategoryListServiceInterface',
    'CategoryRegisterServiceInterface',
  ],
})
export class CategoriesModule {}
