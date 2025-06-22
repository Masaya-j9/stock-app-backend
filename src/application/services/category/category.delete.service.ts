import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { catchError, map, Observable, switchMap, throwError, of } from 'rxjs';
import { CategoryDeleteInputDto } from '../../dto/input/category/category.delete.input.dto';
import { CategoryDeleteOutputDto } from '../../dto/output/category/category.delete.output.dto';
import { CategoryDeleteServiceInterface } from './category.delete.interface';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryDeleteOutputBuilder } from '../../dto/output/category/category.delete.output.builder';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { Logger } from '@nestjs/common';
import { CategoryNotFoundOperator } from '../../../common/types/rxjs-operator.types';

@Injectable()
export class CategoryDeleteService implements CategoryDeleteServiceInterface {
  private readonly logger = new Logger(CategoryDeleteService.name);

  constructor(public readonly categoriesDatasource: CategoriesDatasource) {}

  service(input: CategoryDeleteInputDto): Observable<CategoryDeleteOutputDto> {
    const { categoryId } = input;

    this.logger.log(`Starting delete for category with ID: ${categoryId}`);

    return this.categoriesDatasource.findByCategoryId(categoryId).pipe(
      this.throwIfCategoryNotFound(),
      switchMap((category) => {
        //ファクトリでドメインエンティティに変換
        const domainCategory =
          CategoryDomainFactory.fromInfrastructure(category);
        const deletedCategory = domainCategory.delete();
        return this.categoriesDatasource
          .deleteCategory(deletedCategory.id)
          .pipe(
            map(() => {
              this.logger.log(
                `Category deleted successfully: ${deletedCategory.id}`
              );
              const builder = new CategoryDeleteOutputBuilder(
                deletedCategory.id,
                deletedCategory.name,
                deletedCategory.description,
                deletedCategory.createdAt,
                deletedCategory.updatedAt,
                deletedCategory.deletedAt
              );
              return builder.build();
            }),
            catchError((error) => this.handleDeleteError(error))
          );
      })
    );
  }

  private throwIfCategoryNotFound(): CategoryNotFoundOperator {
    return (source$) =>
      source$.pipe(
        switchMap((category) =>
          category
            ? of(category)
            : throwError(() => new NotFoundException('Category not found'))
        )
      );
  }

  private handleDeleteError(error: any): Observable<never> {
    if (error.code === 'ER_ROW_IS_REFERENCED') {
      return throwError(
        () =>
          new ConflictException(
            'This category cannot be deleted due to related data!'
          )
      );
    }
    this.logger.error('Error deleting category:', error);
    return throwError(
      () => new InternalServerErrorException('Transaction processing failed')
    );
  }
}
