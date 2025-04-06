import {
  ConflictException,
  NotFoundException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ItemRegisterServiceInterface } from './item.register.interface';
import {
  Observable,
  switchMap,
  lastValueFrom,
  throwError,
  of,
  map,
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
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class ItemRegisterService implements ItemRegisterServiceInterface {
  private readonly logger = new Logger(ItemRegisterService.name);

  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
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
  public checkCategoriesExist(categoryIds: number[]): Observable<Categories[]> {
    return this.categoriesDatasource.findByCategoryIds(categoryIds).pipe(
      map((categories) => {
        if (categories.length !== categoryIds.length) {
          throw new NotFoundException('指定されたカテゴリはすべて存在しません');
        }
        return categories;
      })
    );
  }

  public registerItemWithinTransaction(
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
          switchMap((newItem) =>
            this.itemsDatasource
              .createItemCategoryWithinTransaction(
                newItem.id,
                categoryIds,
                transactionalEntityManager
              )
              .pipe(
                map(() => {
                  this.logger.log(
                    `'Item registered successfully!' ${newItem.id}`
                  );
                  const builder = new ItemRegisterOutputBuilder(
                    newItem.id,
                    newItem.name,
                    newItem.quantity,
                    newItem.description,
                    newItem.createdAt,
                    newItem.updatedAt,
                    categories
                  );
                  subscriber.next(builder.build());
                  subscriber.complete();
                })
              )
          )
        )
        .subscribe({
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
}
