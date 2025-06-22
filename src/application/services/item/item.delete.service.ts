import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  map,
  Observable,
  switchMap,
  forkJoin,
  filter,
  defaultIfEmpty,
  mergeMap,
  throwError,
} from 'rxjs';
import { ItemDeleteInputDto } from '../../dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../dto/output/item/item.delete.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { ItemDeleteOutputBuilder } from '../../dto/output/item/item.delete.output.builder';
import { ItemDeleteServiceInterface } from './item.delete.interface';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { Logger } from '@nestjs/common';
import {
  ItemNotFoundOperator,
  CategoryIdsNotFoundOperator,
} from '../../../common/types/rxjs-operator.types';

@Injectable()
export class ItemDeleteService implements ItemDeleteServiceInterface {
  private readonly logger = new Logger(ItemDeleteService.name);

  constructor(public readonly itemsDatasource: ItemsDatasource) {}

  service(input: ItemDeleteInputDto): Observable<ItemDeleteOutputDto> {
    const { itemId } = input;

    this.logger.log(`Starting delete for item with ID: ${itemId}`);
    return forkJoin([
      this.itemsDatasource
        .findItemById(itemId)
        .pipe(this.throwIfItemNotFound(itemId)),
      this.itemsDatasource
        .findCategoryIdsByItemId(itemId)
        .pipe(this.throwIfCategoryIdsNotFound(itemId)),
    ]).pipe(
      switchMap(([item, categoryIds]) => {
        const domainItem = ItemDomainFactory.fromInfrastructureSingle(
          item,
          categoryIds
        );

        domainItem.deletedAt
          ? (() => {
              throw new ConflictException(
                `Item with ID ${itemId} is already deleted`
              );
            })()
          : null;

        const deletedItem = domainItem.delete();
        return this.itemsDatasource.deletedById(itemId).pipe(
          map(() => {
            this.logger.log(`Deleted item with ID: ${itemId}`);
            const builder = new ItemDeleteOutputBuilder(
              deletedItem.id,
              deletedItem.name,
              deletedItem.quantity,
              deletedItem.description,
              deletedItem.updatedAt,
              deletedItem.deletedAt
            );
            return builder.build();
          })
        );
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
}
