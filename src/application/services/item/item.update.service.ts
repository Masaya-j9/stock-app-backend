import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import {
  forkJoin,
  lastValueFrom,
  Observable,
  switchMap,
  throwError,
  map,
  Subscriber,
  of,
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
      this.itemsDatasource.findItemById(itemId),
      this.itemsDatasource.findCategoryIdsByItemId(itemId),
      this.itemsDatasource.findItemByName(name.value()),
    ]).pipe(
      switchMap(([items, currentCategoryIds, conflictItem]) => {
        this.validateItemFound(items);
        this.validateCategoryIdsFound(currentCategoryIds);
        this.validateUniqueItemName(name, items.name);
        this.validateUniqueOtherItem(
          name,
          conflictItem ? conflictItem.name : undefined
        );

        // 現在のDBにあるItemの情報
        const domainItem: Item = ItemDomainFactory.fromInfrastructureSingle(
          items,
          currentCategoryIds
        );

        // カテゴリの差分を取得
        const categoryDiffResult = domainItem.getCategoryDiff(categoryIds);
        if (!categoryDiffResult) {
          return throwError(
            () =>
              new InternalServerErrorException(
                'Failed to calculate category differences'
              )
          );
        }
        const { addCategoryIds, deleteCategoryIds }: categoryDiff =
          categoryDiffResult;

        // ドメインエンティティを更新
        const updatedDomainItem = this.tryUpdateDomainItem(
          domainItem,
          name.value(),
          quantity.value(),
          description.value(),
          categoryIds
        );

        // トランザクション処理をsubscriber内で行う
        return new Observable<ItemUpdateOutputDto>((subscriber) => {
          this.itemsDatasource.dataSource.manager
            .transaction(async (transactionalEntityManager) => {
              try {
                const updatedItemWithCategories = await lastValueFrom(
                  this.updateItemWithinTransaction(
                    updatedDomainItem,
                    addCategoryIds,
                    deleteCategoryIds,
                    transactionalEntityManager
                  )
                );

                subscriber.next(updatedItemWithCategories);
                subscriber.complete();
              } catch (error) {
                this.logger.error('Error during item update:', error);
                subscriber.error(
                  new InternalServerErrorException(
                    '更新処理中にエラーが発生しました'
                  )
                );
              }
            })
            .catch((error) => {
              this.logger.error('Transaction failed:', error);
              subscriber.error(
                new InternalServerErrorException(
                  'トランザクション処理中にエラーが発生しました'
                )
              );
            });
        });
      })
    );
  }

  //物品の存在チェック
  private validateItemFound(items: Items | null): Observable<void> {
    if (items === null) {
      return throwError(() => new NotFoundException('Item not found'));
    }
    return of(undefined);
  }

  //カテゴリIDがDBに存在するかチェック
  private validateCategoryIdsFound(categoryIds: number[]): Observable<void> {
    if (!categoryIds) {
      return throwError(() => new NotFoundException('Category IDs not found'));
    }
    return of(undefined);
  }

  //更新後の物品名と現在の物品名との重複チェック
  private validateUniqueItemName(
    name: TextAmount,
    currentName: string
  ): Observable<void> {
    const uniqueItemName = Unique.of(name.value(), currentName);
    if (uniqueItemName.isDuplicate(currentName)) {
      return throwError(
        () => new ConflictException('This value is not unique')
      );
    }
    return of(undefined);
  }

  //更新後の物品名と他の物品名との重複チェック
  private validateUniqueOtherItem(
    name: TextAmount,
    otherItemName: string | undefined
  ): Observable<void> {
    const uniqueItemName = Unique.of(name.value(), otherItemName);
    if (uniqueItemName.isDuplicate(otherItemName)) {
      return throwError(
        () => new ConflictException('This value is not unique')
      );
    }
    return of(undefined);
  }

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

  tryUpdateDomainItem(
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

    if (!updatedDomainItem) {
      throw new BadRequestException('Invalid update parameters');
    }

    return updatedDomainItem;
  }

  private updateItemWithinTransaction(
    updatedDomainItem: Item,
    addIds: number[],
    deleteIds: number[],
    transactionalEntityManager
  ): Observable<ItemUpdateOutputDto> {
    return new Observable<ItemUpdateOutputDto>((subscriber) => {
      // アイテムの更新
      this.itemsDatasource
        .updateItemWithinTransactionQuery(
          updatedDomainItem.id,
          updatedDomainItem.name,
          updatedDomainItem.quantity,
          updatedDomainItem.description,
          transactionalEntityManager
        )
        .pipe(
          switchMap((updatedItem) => {
            if (!updatedItem) {
              return throwError(
                () => new InternalServerErrorException('Failed to update item')
              );
            }
            // カテゴリの追加・削除処理
            if (addIds.length > 0 || deleteIds.length > 0) {
              return this.itemsDatasource
                .updateItemCategoriesWithinTransactionQuery(
                  updatedDomainItem.id,
                  addIds,
                  deleteIds,
                  transactionalEntityManager
                )
                .pipe(
                  switchMap(({ categoryIds }) => {
                    // カテゴリIDからカテゴリ情報を取得
                    return this.categoriesDatasource
                      .findByCategoryIds(categoryIds)
                      .pipe(
                        map((updatedCategories) => {
                          this.emitItemUpdate(
                            subscriber,
                            updatedDomainItem,
                            updatedCategories
                          );
                        })
                      );
                  })
                );
            } else {
              this.emitItemUpdate(subscriber, updatedDomainItem, []);
            }
            this.logger.log('Item updated successfully');
          })
        )
        .subscribe({
          error: (err) => subscriber.error(err),
        });
    });
  }
}
