import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  forkJoin,
  Observable,
  switchMap,
  throwError,
  filter,
  defaultIfEmpty,
  mergeMap,
  from,
  firstValueFrom,
  of,
} from 'rxjs';
import { UpdateItemQuantityServiceInterface } from './update.item.quantity.interface';
import { UpdateItemQuantityInputDto } from '../../dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../dto/output/item/update.item.quantity.output.dto';
import { UpdateItemQuantityOutputBuilder } from '../../dto/output/item/update.item.quantity.output.builder';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import {
  ItemNotFoundOperator,
  CategoryIdsNotFoundOperator,
} from '../../../common/types/rxjs-operator.types';

@Injectable()
export class UpdateItemQuantityService
  implements UpdateItemQuantityServiceInterface
{
  private readonly logger = new Logger(UpdateItemQuantityService.name);

  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  service(
    input: UpdateItemQuantityInputDto,
    itemId: number
  ): Observable<UpdateItemQuantityOutputDto> {
    const quantity = Quantity.of(input.quantity);

    this.logger.log(`Starting update for item quantity with ID: ${itemId}`);
    return forkJoin([
      this.itemsDatasource
        .findItemById(itemId)
        .pipe(this.throwIfItemNotFound()),
      this.itemsDatasource
        .findCategoryIdsByItemId(itemId)
        .pipe(this.throwIfCategoryIdsNotFound()),
    ]).pipe(
      switchMap(([items, currentCategoryIds]) => {
        const domainItem: Item = ItemDomainFactory.fromInfrastructureSingle(
          items,
          currentCategoryIds
        );
        const updatedDomainItem = domainItem.updateQuantity(quantity.value());

        return from(
          this.itemsDatasource.dataSource.transaction(async (manager) => {
            return await firstValueFrom(
              this.itemsDatasource.updateQuantityById(
                updatedDomainItem.id,
                Quantity.of(updatedDomainItem.quantity),
                manager
              )
            );
          })
        ).pipe(
          switchMap((updateResult) => {
            this.logger.log(
              `Successfully updated item quantity with ID: ${itemId}`
            );
            return of(
              new UpdateItemQuantityOutputBuilder(
                updatedDomainItem.id,
                updateResult.quantity,
                updateResult.updatedAt
              ).build()
            );
          })
        );
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
}
