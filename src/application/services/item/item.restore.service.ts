import {
  map,
  Observable,
  switchMap,
  forkJoin,
  from,
  catchError,
  throwError,
} from 'rxjs';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ItemRestoreServiceInterface } from './item.restore.interface';
import { ItemRestoreInputDto } from '../../dto/input/item/item.restore.input.dto';
import { ItemRestoreOutputDto } from '../../dto/output/item/item.restore.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemRestoreOutputBuilder } from '../../dto/output/item/item.restore.output.builder';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { Items } from '../../../infrastructure/orm/entities/items.entity';

@Injectable()
export class ItemRestoreService implements ItemRestoreServiceInterface {
  private readonly logger = new Logger(ItemRestoreService.name);

  constructor(public readonly itemsDatasource: ItemsDatasource) {}

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
          this.itemsDatasource.findDeletedItemById(itemId),
          this.itemsDatasource.findCategoryIdsByItemId(itemId),
        ]).pipe(
          switchMap(([item, categoryIds]) => {
            this.ensureItemExists(item, itemId);
            this.ensureCategoriesExist(categoryIds, itemId);

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
              map(() => {
                this.logger.log(
                  `Successfully restored item with ID: ${restoredItem.id}`
                );
                return new ItemRestoreOutputBuilder(restoredItem).build();
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
      switchMap((result) => from(queryRunner.release()).pipe(map(() => result)))
    );
  }

  /**
   *
   * @param item
   * @param itemId
   * @returns {void}
   * @throws {NotFoundException} - 物品が見つからない場合にスローされます。
   */
  private ensureItemExists(item: Items, itemId: number): void {
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
  }

  /**
   * @param categoryIds
   * @param itemId
   * @returns {void}
   * @throws {NotFoundException} - カテゴリが見つからない場合にスローされます。
   */
  private ensureCategoriesExist(categoryIds: number[], itemId: number): void {
    !categoryIds
      ? (() => {
          throw new NotFoundException(
            `Categories not found for item with ID ${itemId}`
          );
        })()
      : undefined;
  }

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
}
