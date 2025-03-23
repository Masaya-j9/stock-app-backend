import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryListServiceInterface } from './category.list.interface';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { CategoryListInputDto } from '../../dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../dto/output/category/category.list.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryListOutputBuilder } from '../../dto/output/category/category.list.output.builder';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';

@Injectable()
export class CategoryListService implements CategoryListServiceInterface {
  constructor(
    @Inject()
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * @param {CategoryListInputDto} input - リクエスト情報
   * @returns {Observable<CategoryListOutputDto>} - 登録されているカテゴリーの一覧情報を含むObservableオブジェクト
   *
   * @throws {HttpException} カテゴリーが見つからない場合、404エラーをスローします。
   */
  service(input: CategoryListInputDto): Observable<CategoryListOutputDto> {
    const pageNumber: number = input.pages;
    return this.categoriesDatasource.findCategoryList(pageNumber).pipe(
      switchMap((categories) => {
        if (categories.length === 0) {
          return throwError(
            () => new NotFoundException('Categories not found')
          );
        }
        const domainCategories =
          CategoryDomainFactory.fromInfrastructureList(categories);
        const builder = new CategoryListOutputBuilder(
          domainCategories,
          categories.length
        );
        return of(builder.build());
      })
    );
  }
}
