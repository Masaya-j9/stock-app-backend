import {
  catchError,
  concatMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryUpdateInputDto } from '../../dto/input/category/category.update.input.dto';
import { CategoryUpdateOutputDto } from '../../dto/output/category/category.update.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryDomainService } from '../../../domain/inventory/items/services/category.domain.service';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { CategoryUpdateOutputBuilder } from '../../dto/output/category/category.update.builder';
import { Logger } from '@nestjs/common';

@Injectable()
export class CategoryUpdateService {
  private readonly logger = new Logger(CategoryUpdateService.name);

  constructor(
    public readonly categoriesDatasource: CategoriesDatasource,
    public readonly categoryDomainService: CategoryDomainService
  ) {}

  service(
    input: CategoryUpdateInputDto,
    categoryId: number
  ): Observable<CategoryUpdateOutputDto> {
    const { name, description } = input;

    this.logger.log(`Starting update for category with ID: ${categoryId}`);

    return this.categoriesDatasource.findByCategoryId(categoryId).pipe(
      switchMap((categories) => {
        if (!categories) {
          return throwError(() => new NotFoundException('Category not found'));
        }

        //ファクトリでドメインエンティティに変換
        const category = CategoryDomainFactory.fromInfrastructure(categories);

        //ドメインサービスに渡す
        return this.categoryDomainService
          .updateCategoryFields(category, name, description)
          .pipe(
            switchMap((updatedCategory) => {
              if (!updatedCategory) {
                return throwError(
                  () => new ConflictException('Category was not updated')
                );
              }

              //トランザクション処理
              return this.categoriesDatasource
                .updateCategory(
                  categoryId,
                  updatedCategory.name,
                  updatedCategory.description
                )
                .pipe(
                  concatMap(() => {
                    this.logger.log(
                      `Category successfully updated: ${updatedCategory.id}, ${updatedCategory.name}`
                    );
                    const builder = new CategoryUpdateOutputBuilder(
                      updatedCategory.id,
                      updatedCategory.name,
                      updatedCategory.description,
                      updatedCategory.updatedAt
                    );
                    return of(builder.build());
                  }),
                  catchError((error) => {
                    this.logger.error('Error updating category:', error);
                    return throwError(() => error); // エラーを再スロー
                  })
                );
            })
          );
      })
    );
  }
}
