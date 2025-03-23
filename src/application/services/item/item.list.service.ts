import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemListServiceInterface } from './item.list.interface';
import { map, Observable, switchMap, of, forkJoin, throwError } from 'rxjs';
import { ItemListInputDto } from '../../dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../dto/output/item/item.list.output.dto';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListOutputBuilder } from '../../dto/output/item/item.list.output.builder';
import { ItemDomainFactory } from '../../../domain/inventory/items/factories/item.domain.factory';
import { CategoryDomainFactory } from '../../../domain/inventory/items/factories/category.domain.factory';

@Injectable()
export class ItemListService implements ItemListServiceInterface {
  // 登録されている物品情報に関するコンストラクタ
  constructor(
    public readonly ItemsDatasource: ItemsDatasource,
    public readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 登録されいている物品の一覧を取得する
   * @param {ItemListInputDto} input - リクエスト情報
   * @returns{Observable<Builder>} - 登録されている物品の一覧情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 物品が見つからない場合、404エラーをスローします。
   */
  service(input: ItemListInputDto): Observable<ItemListOutputDto> {
    const { pages, sortOrder } = input;
    return this.ItemsDatasource.findItemList(pages, sortOrder).pipe(
      switchMap((items) => {
        if (items.length === 0) {
          return throwError(() => new NotFoundException('Items not found'));
        }
        const itemIds = items.map((item) => item.id);
        return forkJoin([
          this.categoriesDatasource.findByCategories(itemIds),
          this.categoriesDatasource.findCategoryIdsAndItemIds(itemIds),
          of(items),
        ]);
      }),
      map(([categories, itemIdsAndCategoryIds, items]) => {
        const totalCount = items.length;
        const domainItems = items.map((item) =>
          ItemDomainFactory.fromInfrastructure(item, itemIdsAndCategoryIds)
        );
        const domainCategories = categories.map((category) =>
          CategoryDomainFactory.fromInfrastructure(category)
        );
        return new ItemListOutputBuilder(
          domainItems,
          totalCount,
          domainCategories
        ).build();
      })
    );
  }
}
