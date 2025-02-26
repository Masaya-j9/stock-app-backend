import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryListServiceInterface } from './category.list.interface';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { CategoryListInputDto } from '../../dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../dto/output/category/category.list.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryListOutputBuilder } from '../../dto/output/category/category.list.output.builder';

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
        return categories.length === 0
          ? throwError(() => new NotFoundException('Categories not found'))
          : of(categories).pipe(
              map((categories) => {
                const builder = new CategoryListOutputBuilder(
                  categories,
                  categories.length
                );
                return builder.build();
              })
            );
      })
    );
  }
}
