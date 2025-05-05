import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemSingleServiceInterface } from './item.single.interface';
import { ItemSingleInputDto } from '../../dto/input/item/item.single.input.dto';
import { ItemSingleOutputDto } from '../../dto/output/item/item.single.output.dto';
import { ItemSingleOutputBuilder } from '../../dto/output/item/item.single.output.builder';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';
import { map, Observable, switchMap, throwError } from 'rxjs';

@Injectable()
export class ItemSingleService implements ItemSingleServiceInterface {
  // 登録されている物品情報に関するコンストラクタ
  constructor(
    public readonly itemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 登録されている物品を1件取得する
   * @param {ItemSingleInputDto} input - リクエスト情報
   * @returns{Observable<ItemSingleOutputDto>} - 登録されている物品情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 物品が見つからない場合、404エラーをスローします。
   */

  service(input: ItemSingleInputDto): Observable<ItemSingleOutputDto> {
    const itemId = input.itemId;

    return this.itemsDatasource.findItemById(itemId).pipe(
      switchMap((item) => {
        if (!item) {
          return throwError(() => new NotFoundException('Item not found'));
        }
        return this.categoriesDatasource.findCategoriesByItemId(item.id).pipe(
          map((categories) => {
            if (!categories) {
              throw new NotFoundException('Categories not found');
            }
            const categoryIds = categories.map((category) => category.id);
            const domainItem = ItemDomainFactory.fromInfrastructureSingle(
              item,
              categoryIds
            );
            const domainCategories =
              CategoryDomainFactory.fromInfrastructureList(categories);

            const builder = new ItemSingleOutputBuilder(
              domainItem,
              domainCategories
            );
            return builder.build();
          })
        );
      })
    );
  }
}
