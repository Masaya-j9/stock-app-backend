import {
  ConflictException,
  NotFoundException,
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ItemRegisterServiceInterface } from './item.register.interface';
import {
  Observable,
  switchMap,
  lastValueFrom,
  throwError,
  of,
  map,
  mergeMap,
} from 'rxjs';
import { ItemRegisterInputDto } from '../../dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from '../../dto/output/item/item.register.output.dto';
import { ItemRegisterOutputBuilder } from '../../dto/output/item/item.register.output.builder';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { Unique } from '../../../domain/common/value-objects/unique';
import { TextAmount } from '../../../domain/inventory/items/value-objects/text.amount';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Logger } from '@nestjs/common';
import { ItemCreatedEventPublisherInterface } from '../../../application/services/item/item-created-event.publisher.interface';

@Injectable()
export class ItemRegisterService implements ItemRegisterServiceInterface {
  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource,
    @Inject('ItemCreatedEventPublisherInterface')
    public readonly itemCreatedPublisher: ItemCreatedEventPublisherInterface,
    private readonly logger: Logger
  ) {}

  service(input: ItemRegisterInputDto): Observable<ItemRegisterOutputDto> {
    const name = TextAmount.of(input.name);
    const quantity = Quantity.of(input.quantity);
    const description = TextAmount.of(input.description);
    const categoryIds = input.categoryIds;

    return this.checkItemNameConflict(name.value()).pipe(
      switchMap(() => this.checkCategoriesExist(categoryIds)),
      switchMap(
        (categories) =>
          new Observable<ItemRegisterOutputDto>((subscriber) => {
            this.itemsDatasource.dataSource.manager.transaction(
              async (transactionalEntityManager) => {
                try {
                  const item = Item.create(
                    name.value(),
                    quantity.value(),
                    description.value(),
                    categoryIds
                  );
                  const result = await lastValueFrom(
                    this.registerItemWithinTransaction(
                      item.name,
                      item.quantity,
                      item.description,
                      item.categoryIds,
                      categories,
                      transactionalEntityManager
                    )
                  );
                  subscriber.next(result);
                  subscriber.complete();
                } catch (error) {
                  this.logger.error('Error during item registration:', error);
                  subscriber.error(
                    new InternalServerErrorException(
                      '登録処理中にエラーが発生しました'
                    )
                  );
                }
              }
            );
          })
      )
    );
  }

  /**
   * 物品名の重複を確認する
   * @param name
   * @returns Observable<boolean>
   */
  public checkItemNameConflict(name: string): Observable<boolean> {
    return this.itemsDatasource.findItemByName(name).pipe(
      switchMap((existingItem) => {
        const existingItemName = existingItem ? existingItem.name : undefined;
        const uniqueItemName = Unique.of(name, existingItem?.name);
        return uniqueItemName.isDuplicate(existingItemName)
          ? throwError(
              () => new ConflictException('この物品名が既に登録されています')
            )
          : of(true);
      })
    );
  }

  /**
   * カテゴリが存在するか確認する
   * @param categoryIds
   * @returns Observable<Categories[]>
   */
  private checkCategoriesExist(
    categoryIds: number[]
  ): Observable<Categories[]> {
    return this.categoriesDatasource
      .findByCategoryIds(categoryIds)
      .pipe(
        mergeMap((categories) =>
          categories.length !== categoryIds.length
            ? throwError(
                () =>
                  new NotFoundException(
                    '指定されたカテゴリはすべて存在しません'
                  )
              )
            : of(categories)
        )
      );
  }

  private registerItemWithinTransaction(
    name: string,
    quantity: number,
    description: string,
    categoryIds: number[],
    categories: Categories[],
    transactionalEntityManager: any
  ): Observable<ItemRegisterOutputDto> {
    return new Observable<ItemRegisterOutputDto>((subscriber) => {
      this.itemsDatasource
        .createItemWithinTransaction(
          name,
          quantity,
          description,
          transactionalEntityManager
        )
        .pipe(
          switchMap((newItem: Items) =>
            this.itemsDatasource
              .createItemCategoryWithinTransaction(
                newItem.id,
                categoryIds,
                transactionalEntityManager
              )
              .pipe(
                switchMap(() =>
                  this.publishItemCreatedEvent(newItem, categoryIds, categories)
                )
              )
          )
        )
        .subscribe({
          next: (output) => {
            subscriber.next(output);
            subscriber.complete();
          },
          error: (error) => {
            this.logger.error(
              'Transaction error during item registration:',
              error
            );
            subscriber.error(
              new InternalServerErrorException(
                '登録処理中にエラーが発生しました'
              )
            );
          },
        });
    });
  }

  /**
   * アイテム作成イベントをpublishする
   */
  private publishItemCreatedEvent(
    newItem: Items,
    categoryIds: number[],
    categories: Categories[]
  ): Observable<ItemRegisterOutputDto> {
    return this.itemCreatedPublisher
      .publishItemCreatedEvent({
        id: newItem.id,
        name: newItem.name,
        quantity: newItem.quantity,
        description: newItem.description,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
        categoryIds: categoryIds,
      })
      .pipe(
        map(() => {
          this.logger.log(
            `Item registered & event published! ID: ${newItem.id}`
          );
          return new ItemRegisterOutputBuilder(
            newItem.id,
            newItem.name,
            newItem.quantity,
            newItem.description,
            newItem.createdAt,
            newItem.updatedAt,
            categories
          ).build();
        })
      );
  }
}
