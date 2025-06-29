import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletedItemListServiceInterface } from './deleted.item.list.interface';
import {
  Observable,
  forkJoin,
  map,
  of,
  switchMap,
  throwError,
  filter,
  defaultIfEmpty,
  mergeMap,
} from 'rxjs';
import { DeletedItemListInputDto } from '../../dto/input/item/deleted.item.list.input.dto';
import { DeletedItemListOutputDto } from '../../dto/output/item/deleted.item.list.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { DeletedItemListOutputBuilder } from '../../dto/output/item/deleted.item.list.output.builder';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';
import {
  ItemListNotFoundOperator,
  CategoriesNotFoundOperator,
} from '../../../common/types/rxjs-operator.types';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';

@Injectable()
export class DeletedItemListService implements DeletedItemListServiceInterface {
  // 登録されている物品情報に関するコンストラクタ
  constructor(
    public readonly ItemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 論理削除されている物品の一覧を取得する
   * @param {DeletedItemListInputDto} input - リクエスト情報
   * @returns {Observable<DeletedItemListOutputDto>} - 論理削除されている物品の一覧情報を含むObservableオブジェクト
   *
   * @throws {NotFoundException} 物品が見つからない場合、404エラーをスローします。
   */

  service(
    input: DeletedItemListInputDto
  ): Observable<DeletedItemListOutputDto> {
    const pagination = Pagination.of(input.pages);
    const sortOrder = SortOrder.of(input.sortOrder);

    return this.ItemsDatasource.findDeletedItemList(pagination, sortOrder).pipe(
      this.throwIfItemsNotFound(),
      switchMap((deletedItems) => {
        const itemIds = deletedItems.map((item) => item.id);
        return forkJoin([
          this.categoriesDatasource
            .findByCategoriesForDeletedItems(itemIds)
            .pipe(this.throwIfCategoriesNotFound()),
          this.categoriesDatasource.findCategoryIdsAndItemIds(itemIds),
          of(deletedItems),
          this.ItemsDatasource.countDeletedAll(),
        ]);
      }),
      map(
        ([categories, itemIdsAndCategoryIds, deletedItems, totalItemCount]) => {
          const totalCount = deletedItems.length;
          const deletedDomainItems = deletedItems.map((item) =>
            ItemDomainFactory.fromInfrastructure(item, itemIdsAndCategoryIds)
          );
          const domainCategories = categories.map((category) =>
            CategoryDomainFactory.fromInfrastructure(category)
          );
          return new DeletedItemListOutputBuilder(
            deletedDomainItems,
            totalCount,
            pagination.calcTotalPages(totalItemCount),
            domainCategories
          ).build();
        }
      )
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
