import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CategoryRegisterServiceInterface } from './category.register.interface';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { CategoryRegisterInputDto } from '../../dto/input/category/category.register.input.dto';
import { CategoryRegisterOutputDto } from '../../dto/output/category/category.register.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryRegisterOutputBuilder } from '../../dto/output/category/category.register.output.builder';
import { Unique } from '../../../domain/common/value-objects/unique';

@Injectable()
export class CategoryRegisterService
  implements CategoryRegisterServiceInterface
{
  constructor(
    @Inject()
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * @param {CategoryRegisterInputDto} input - リクエスト情報
   * @returns {Observable<CategoryRegisterOutputDto>} - カテゴリ情報を含むObservableオブジェクト
   *
   *
   */

  service(
    input: CategoryRegisterInputDto
  ): Observable<CategoryRegisterOutputDto> {
    const { name, description } = input;
    return this.categoriesDatasource.findCategoryByName(name).pipe(
      switchMap((existingCategory) => {
        const existingCategoryName = existingCategory
          ? existingCategory.name
          : undefined;
        const uniqueCategoryName = Unique.of(name, existingCategory?.name);

        return uniqueCategoryName.isDuplicate(existingCategoryName)
          ? throwError(
              () => new ConflictException('カテゴリ名が既に存在します')
            )
          : this.categoriesDatasource.createCategory(name, description).pipe(
              map((createdCategory) => {
                const builder = new CategoryRegisterOutputBuilder(
                  createdCategory.id,
                  name,
                  description,
                  new Date(),
                  new Date()
                );
                return builder.build();
              })
            );
      })
    );
  }
}
