import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryListController } from '../controllers/category/category.controller';
import { CategoryListService } from '../../application/services/category/category.list.service';
import { CategoryRegisterService } from '../../application/services/category/category.register.service';
import { CategoryUpdateService } from '../../application/services/category/category.update.service';
import { CategoryDeleteService } from '../../application/services/category/category.delete.service';
import { CategoryDomainService } from '../../domain/inventory/items/services/category.domain.service';
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
    {
      provide: 'CategoryUpdateServiceInterface',
      useClass: CategoryUpdateService,
    },
    {
      provide: 'CategoryDeleteServiceInterface',
      useClass: CategoryDeleteService,
    },
    {
      provide: CategoryDomainService,
      useClass: CategoryDomainService,
    },
  ],
  exports: [
    CategoriesDatasource,
    'CategoryListServiceInterface',
    'CategoryRegisterServiceInterface',
    'CategoryUpdateServiceInterface',
    'CategoryDeleteServiceInterface',
    CategoryDomainService,
  ],
})
export class CategoriesModule {}
