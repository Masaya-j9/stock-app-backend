import {
  map,
  Observable,
  switchMap,
  of,
  forkJoin,
  filter,
  defaultIfEmpty,
  mergeMap,
  throwError,
} from 'rxjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemListServiceInterface } from './item.list.interface';
import { ItemListInputDto } from '../../dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../dto/output/item/item.list.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListOutputBuilder } from '../../dto/output/item/item.list.output.builder';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';
import {
  ItemListNotFoundOperator,
  CategoriesNotFoundOperator,
} from 'src/common/types/rxjs-operator.types';

@Injectable()
export class ItemListService implements ItemListServiceInterface {
  // 登録されている物品情報に関するコンストラクタ
  constructor(
    public readonly ItemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 登録されいている物品の一覧を取得する
   * @param {ItemListInputDto} input - リクエスト情報
   * @returns{Observable<ItemListOutputDto>} - 登録されている物品の一覧情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 物品が見つからない場合、404エラーをスローします。
   */
  service(input: ItemListInputDto): Observable<ItemListOutputDto> {
    const pagination = Pagination.of(input.pages);
    const sortOrder = SortOrder.of(input.sortOrder);
    return this.ItemsDatasource.findItemList(pagination, sortOrder).pipe(
      this.throwIfItemsNotFound(),
      switchMap((items) => {
        const itemIds = items.map((item) => item.id);
        return forkJoin([
          this.categoriesDatasource
            .findByCategories(itemIds)
            .pipe(this.throwIfCategoriesNotFound()),
          this.categoriesDatasource.findCategoryIdsAndItemIds(itemIds),
          of(items),
          this.ItemsDatasource.countAll(),
        ]);
      }),
      map(([categories, itemIdsAndCategoryIds, items, totalItemCount]) => {
        const totalCount = items.length;
        const domainItems = items.map((item) =>
          ItemDomainFactory.fromInfrastructure(item, itemIdsAndCategoryIds)
        );
        const domainCategories = categories.map((category) =>
          CategoryDomainFactory.fromInfrastructure(category)
        );
        return new ItemListOutputBuilder(
          domainItems,
          totalCount,
          pagination.calcTotalPages(totalItemCount),
          domainCategories
        ).build();
      })
    );
  }

  private throwIfItemsNotFound = (): ItemListNotFoundOperator => (source$) =>
    source$.pipe(
      filter((items: Items[]) => items.length > 0),
      defaultIfEmpty(undefined),
      mergeMap((items) =>
        items
          ? [items]
          : throwError(() => new NotFoundException('Items not found'))
      )
    );

  private throwIfCategoriesNotFound =
    (): CategoriesNotFoundOperator => (source$) =>
      source$.pipe(
        filter(
          (categories: Categories[] | undefined) =>
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
