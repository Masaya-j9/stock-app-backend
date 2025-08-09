import {
  map,
  Observable,
  switchMap,
  forkJoin,
  from,
  catchError,
  throwError,
  filter,
  defaultIfEmpty,
  mergeMap,
  finalize,
} from 'rxjs';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ItemRestoreServiceInterface } from './item.restore.interface';
import { ItemRestoreInputDto } from '../../dto/input/item/item.restore.input.dto';
import { ItemRestoreOutputDto } from '../../dto/output/item/item.restore.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemRestoreOutputBuilder } from '../../dto/output/item/item.restore.output.builder';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import {
  ItemNotFoundOperator,
  CategoryIdsNotFoundOperator,
} from '../../../common/types/rxjs-operator.types';
import { ItemRestoreEventPublisherInterface } from './events/item.restore.event.publisher.interface';

@Injectable()
export class ItemRestoreService implements ItemRestoreServiceInterface {
  private readonly logger = new Logger(ItemRestoreService.name);

  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    @Inject('ItemRestoreEventPublisherInterface')
    private readonly itemRestorePublisher: ItemRestoreEventPublisherInterface
  ) {}

  /**
   * 削除された物品を復元する
   * @param input - リクエスト情報
   * @returns {Observable<ItemRestoreOutputDto>} - 復元された物品情報を含むObservableオブジェクト
   * @throws {NotFoundException} - 物品が見つからない場合にスローされます。
   * @throws {ConflictException} - 物品が削除されていない場合にスローされます。
   */
  service(input: ItemRestoreInputDto): Observable<ItemRestoreOutputDto> {
    const itemId = input.id;
    this.logger.log(`Starting restore for item with ID: ${itemId}`);

    const queryRunner = this.itemsDatasource.dataSource.createQueryRunner();

    return from(queryRunner.connect()).pipe(
      switchMap(() => from(queryRunner.startTransaction())),
      switchMap(() =>
        forkJoin([
          this.itemsDatasource
            .findDeletedItemById(itemId)
            .pipe(this.throwIfItemNotFound(itemId)),
          this.itemsDatasource
            .findCategoryIdsByItemId(itemId)
            .pipe(this.throwIfCategoryIdsNotFound(itemId)),
        ]).pipe(
          switchMap(([item, categoryIds]) => {
            const restoredItem = this.ensureItemIsDeleted(
              item,
              categoryIds
            ).restore();

            return this.itemsDatasource
              .restoreDeletedItemById(restoredItem.id, queryRunner.manager)
              .pipe(map(() => restoredItem));
          }),
          switchMap((restoredItem) =>
            from(queryRunner.commitTransaction()).pipe(
              switchMap(() =>
                this.publishItemRestoredEvent(restoredItem).pipe(
                  map(() => restoredItem),
                  catchError(() =>
                    throwError(
                      () =>
                        new InternalServerErrorException(
                          '復元処理中にエラーが発生しました'
                        )
                    )
                  )
                )
              ),
              map((item) => {
                this.logger.log(
                  `Successfully restored item with ID: ${item.id}`
                );
                return new ItemRestoreOutputBuilder(item).build();
              })
            )
          )
        )
      ),
      catchError((err) =>
        from(queryRunner.rollbackTransaction()).pipe(
          switchMap(() => {
            if (
              err instanceof NotFoundException ||
              err instanceof ConflictException
            ) {
              // 既に想定されている例外ならそのまま投げる
              return throwError(() => err);
            }
            // それ以外の例外はInternalServerErrorExceptionに変換
            return throwError(
              () => new InternalServerErrorException(err.message)
            );
          })
        )
      ),
      finalize(() => {
        queryRunner.release();
      })
    );
  }

  private throwIfItemNotFound: (itemId: number) => ItemNotFoundOperator =
    (itemId) => (source$) =>
      source$.pipe(
        filter((item) => !!item),
        defaultIfEmpty(null),
        mergeMap((item) =>
          item
            ? [item]
            : throwError(
                () => new NotFoundException(`Item with ID ${itemId} not found`)
              )
        )
      );

  private throwIfCategoryIdsNotFound: (
    itemId: number
  ) => CategoryIdsNotFoundOperator = (itemId) => (source$) =>
    source$.pipe(
      filter((categoryIds) => !!categoryIds),
      defaultIfEmpty(null),
      mergeMap((categoryIds) =>
        categoryIds
          ? [categoryIds]
          : throwError(
              () =>
                new NotFoundException(
                  `Categories not found for item with ID ${itemId}`
                )
            )
      )
    );

  /**
   * @param item
   * @param categoryIds
   * @returns {ReturnType<typeof ItemDomainFactory.fromInfrastructureSingle>}
   * @throws {ConflictException} - 物品が削除されていない場合にスローされます。
   * */
  private ensureItemIsDeleted(
    item: Items,
    categoryIds: number[]
  ): ReturnType<typeof ItemDomainFactory.fromInfrastructureSingle> {
    const domainItem = ItemDomainFactory.fromInfrastructureSingle(
      item,
      categoryIds
    );
    if (!domainItem.deletedAt) {
      throw new ConflictException(`Item with ID ${item.id} is not deleted`);
    }
    return domainItem;
  }

  private publishItemRestoredEvent(
    restoredItem: ReturnType<typeof ItemDomainFactory.fromInfrastructureSingle>
  ): Observable<void> {
    return this.itemRestorePublisher.publishItemRestoreEvent({
      id: restoredItem.id,
      name: restoredItem.name,
      quantity: restoredItem.quantity,
      description: restoredItem.description,
      createdAt: restoredItem.createdAt,
      updatedAt: restoredItem.updatedAt,
      deletedAt: restoredItem.deletedAt,
      categoryIds: restoredItem.categoryIds,
    });
  }
}
