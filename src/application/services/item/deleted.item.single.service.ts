import {
  defaultIfEmpty,
  filter,
  map,
  mergeMap,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletedItemSingleServiceInterface } from './deleted.item.single.interface';
import { DeletedItemSingleInputDto } from '../../dto/input/item/deleted.item.single.input.dto';
import { DeletedItemSingleOutputDto } from '../../dto/output/item/deleted.item.single.output.dto';
import { DeletedItemSingleOutputBuilder } from '../../dto/output/item/deleted.item.single.output.builder';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { ItemNotFoundOperator } from '../../../common/types/rxjs-operator.types';
import { CategoriesNotFoundOperator } from '../../../common/types/rxjs-operator.types';

@Injectable()
export class DeletedItemSingleService
  implements DeletedItemSingleServiceInterface
{
  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 削除された物品を1件取得する
   * @param {DeletedItemSingleInputDto} input - リクエスト情報
   * @returns{Observable<DeletedItemSingleOutputDto>} - 削除された物品情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 物品が見つからない場合、404エラーをスローします。
   */

  service(
    input: DeletedItemSingleInputDto
  ): Observable<DeletedItemSingleOutputDto> {
    const itemId = input.id;

    return this.itemsDatasource.findDeletedItemById(itemId).pipe(
      this.throwIfItemNotFound(),
      switchMap((item) =>
        this.categoriesDatasource.findCategoriesByItemId(item.id).pipe(
          this.throwIfCategoriesNotFound(),
          map((categories) => {
            const categoryIds = categories.map((category) => category.id);
            const domainItem = ItemDomainFactory.fromInfrastructureSingle(
              item,
              categoryIds
            );
            const domainCategories =
              CategoryDomainFactory.fromInfrastructureList(categories);

            const builder = new DeletedItemSingleOutputBuilder(
              domainItem,
              domainCategories
            );
            return builder.build();
          })
        )
      )
    );
  }

  // itemが存在しないときのエラーハンドリング（pipeable operator, 型エイリアス利用）
  private throwIfItemNotFound = (): ItemNotFoundOperator => (source$) =>
    source$.pipe(
      filter((item: Items | undefined): item is Items => !!item),
      defaultIfEmpty(undefined),
      mergeMap((item) =>
        item
          ? [item]
          : throwError(() => new NotFoundException('Item not found'))
      )
    );

  // categoriesが存在しないときのエラーハンドリング（pipeable operator, 型エイリアス利用）
  private throwIfCategoriesNotFound =
    (): CategoriesNotFoundOperator => (source$) =>
      source$.pipe(
        filter(
          (categories: Categories[] | undefined): categories is Categories[] =>
            !!categories && categories.length > 0
        ),
        defaultIfEmpty(undefined),
        mergeMap((categories) =>
          categories
            ? [categories]
            : throwError(() => new NotFoundException('Categories not found'))
        )
      );
}
