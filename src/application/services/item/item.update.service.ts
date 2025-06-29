import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import {
  forkJoin,
  Observable,
  switchMap,
  throwError,
  filter,
  defaultIfEmpty,
  mergeMap,
  of,
  catchError,
  map,
  Subscriber,
} from 'rxjs';
import { ItemUpdateServiceInterface } from './item.update.interface';
import { ItemUpdateInputDto } from '../../dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../dto/output/item/item.update.output.dto';
import { ItemUpdateOutputBuilder } from '../../dto/output/item/item.update.output.builder';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { Logger } from '@nestjs/common';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { categoryDiff } from '../../../domain/inventory/items/types/category.diff.type';
import { Unique } from '../../../domain/common/value-objects/unique';
import { TextAmount } from '../../../domain/inventory/items/value-objects/text.amount';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import {
  ItemNotFoundOperator,
  CategoryIdsNotFoundOperator,
  ItemNameUniqueOperator,
} from '../../../common/types/rxjs-operator.types';

@Injectable()
export class ItemUpdateService implements ItemUpdateServiceInterface {
  private readonly logger = new Logger(ItemUpdateService.name);

  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * @param input - リクエスト情報
   * @param itemId - 更新する物品のID
   * @return {Observable<ItemUpdateOutputDto>} - 更新された物品情報を含むObervable
   */
  service(
    input: ItemUpdateInputDto,
    itemId: number
  ): Observable<ItemUpdateOutputDto> {
    const name = TextAmount.of(input.name);
    const quantity = Quantity.of(input.quantity);
    const description = TextAmount.of(input.description);
    const categoryIds = input.categoryIds;

    this.logger.log(`Starting update for item with ID: ${itemId}`);
    return forkJoin([
      this.itemsDatasource
        .findItemById(itemId)
        .pipe(
          this.throwIfItemNotFound(),
          this.throwIfItemNameUnique(name.value(), itemId)
        ),
      this.itemsDatasource
        .findCategoryIdsByItemId(itemId)
        .pipe(this.throwIfCategoryIdsNotFound()),
    ]).pipe(
      switchMap(([items, currentCategoryIds]) => {
        const domainItem: Item = ItemDomainFactory.fromInfrastructureSingle(
          items,
          currentCategoryIds
        );
        return of(domainItem.getCategoryDiff(categoryIds)).pipe(
          mergeMap((categoryDiffResult) =>
            categoryDiffResult
              ? of({ domainItem, categoryDiffResult })
              : throwError(
                  () =>
                    new InternalServerErrorException(
                      'Failed to calculate category differences'
                    )
                )
          )
        );
      }),
      switchMap(({ domainItem, categoryDiffResult }) => {
        const { addCategoryIds, deleteCategoryIds }: categoryDiff =
          categoryDiffResult;
        const updatedDomainItem = this.tryUpdateDomainItem(
          domainItem,
          name.value(),
          quantity.value(),
          description.value(),
          categoryIds
        );
        return this.runTransactionObservable(
          updatedDomainItem,
          addCategoryIds,
          deleteCategoryIds
        );
      }),
      catchError((error) => {
        this.logger.error('Error during item update:', error);
        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException ||
          error instanceof BadRequestException
        ) {
          return throwError(() => error);
        }
        return throwError(
          () =>
            new InternalServerErrorException('更新処理中にエラーが発生しました')
        );
      })
    );
  }

  private runTransactionObservable(
    updatedDomainItem: Item,
    addIds: number[],
    deleteIds: number[]
  ): Observable<ItemUpdateOutputDto> {
    return new Observable<ItemUpdateOutputDto>((subscriber) => {
      this.itemsDatasource.dataSource.manager
        .transaction((transactionalEntityManager) => {
          return this.updateItemWithinTransactionObservable(
            updatedDomainItem,
            addIds,
            deleteIds,
            transactionalEntityManager
          ).toPromise();
        })
        .then((result) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }

  private updateItemWithinTransactionObservable(
    updatedDomainItem: Item,
    addIds: number[],
    deleteIds: number[],
    transactionalEntityManager
  ): Observable<ItemUpdateOutputDto> {
    return this.itemsDatasource
      .updateItemWithinTransactionQuery(
        updatedDomainItem.id,
        updatedDomainItem.name,
        updatedDomainItem.quantity,
        updatedDomainItem.description,
        transactionalEntityManager
      )
      .pipe(
        this.throwIfUpdateItemFailed(),
        switchMap(() => {
          if (addIds.length > 0 || deleteIds.length > 0) {
            return this.itemsDatasource
              .updateItemCategoriesWithinTransactionQuery(
                updatedDomainItem.id,
                addIds,
                deleteIds,
                transactionalEntityManager
              )
              .pipe(
                switchMap((result) =>
                  this.categoriesDatasource
                    .findByCategoryIds(result.categoryIds)
                    .pipe(
                      map((updatedCategories) =>
                        this.buildItemUpdateOutput(
                          updatedDomainItem,
                          updatedCategories
                        )
                      )
                    )
                )
              );
          } else {
            return this.categoriesDatasource
              .findByCategoryIds([])
              .pipe(
                map((updatedCategories) =>
                  this.buildItemUpdateOutput(
                    updatedDomainItem,
                    updatedCategories
                  )
                )
              );
          }
        })
      );
  }

  private throwIfItemNotFound = (): ItemNotFoundOperator => (source$) =>
    source$.pipe(
      filter((item: Items | null): item is Items => !!item),
      defaultIfEmpty(null),
      mergeMap((item) =>
        item
          ? [item]
          : throwError(() => new NotFoundException('Item not found'))
      )
    );

  private throwIfCategoryIdsNotFound =
    (): CategoryIdsNotFoundOperator => (source$) =>
      source$.pipe(
        filter(
          (categoryIds: number[] | undefined): categoryIds is number[] =>
            !!categoryIds && categoryIds.length > 0
        ),
        defaultIfEmpty(undefined),
        mergeMap((categoryIds) =>
          categoryIds
            ? [categoryIds]
            : throwError(() => new NotFoundException('Category IDs not found'))
        )
      );

  private throwIfItemNameUnique =
    (name: string, itemId: number): ItemNameUniqueOperator =>
    (source$) =>
      source$.pipe(
        filter((conflictItem: Items | undefined) => {
          // 自分自身でない場合のみ重複チェック
          const isNotSelf = !conflictItem || conflictItem.id === itemId;
          const isUnique =
            !conflictItem ||
            !Unique.of(name, conflictItem.name).isDuplicate(conflictItem.name);
          return isNotSelf || isUnique;
        }),
        defaultIfEmpty(undefined),
        mergeMap((conflictItem) =>
          conflictItem
            ? [conflictItem]
            : throwError(
                () => new ConflictException('This value is not unique')
              )
        )
      );

  private emitItemUpdate(
    subscriber: Subscriber<ItemUpdateOutputDto>,
    item: Item,
    categories: Categories[]
  ): void {
    const builder = new ItemUpdateOutputBuilder(
      item.id,
      item.name,
      item.quantity,
      item.description,
      item.updatedAt,
      categories
    );
    subscriber.next(builder.build());
    subscriber.complete();
  }

  private tryUpdateDomainItem(
    domainItem: Item,
    name: string,
    quantity: number,
    description: string,
    categoryIds: number[]
  ): Item {
    const updatedDomainItem = Item.update(
      domainItem,
      name,
      quantity,
      description,
      categoryIds
    );
    return updatedDomainItem
      ? updatedDomainItem
      : (() => {
          throw new BadRequestException('Invalid update parameters');
        })();
  }

  private throwIfUpdateItemFailed = () => (source$) =>
    source$.pipe(
      mergeMap((updatedItem) =>
        updatedItem
          ? of(updatedItem)
          : throwError(
              () => new InternalServerErrorException('Failed to update item')
            )
      )
    );

  private buildItemUpdateOutput(
    item: Item,
    categories: Categories[]
  ): ItemUpdateOutputDto {
    const builder = new ItemUpdateOutputBuilder(
      item.id,
      item.name,
      item.quantity,
      item.description,
      item.updatedAt,
      categories
    );
    return builder.build();
  }
}
