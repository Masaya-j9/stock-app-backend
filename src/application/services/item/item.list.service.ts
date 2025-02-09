import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemListServiceInterface } from './item.list.interface';
import { map, Observable, switchMap, of, forkJoin, throwError } from 'rxjs';
import { ItemListInputDto } from '../../dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../dto/output/item/item.list.output.dto';
import { ItemListDatasource } from '../../../infrastructure/datasources/items/item.list.datasource';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { ItemListOutputBuilder } from '../../dto/output/item/item.list.output.builder';

@Injectable()
export class ItemListService implements ItemListServiceInterface {
  // 登録されている物品情報に関するコンストラクタ
  constructor(
    private readonly itemListDatasource: ItemListDatasource,
    private readonly categoriesDatasource: CategoriesDatasource
  ) {}

  /**
   * 登録されいている物品の一覧を取得する
   * @param {ItemListInputDto} input - リクエスト情報
   * @returns{Observable<Builder>} - 登録されている物品の一覧情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 物品が見つからない場合、404エラーをスローします。
   */
  service(input: ItemListInputDto): Observable<ItemListOutputDto> {
    const pageNumber: number = input.pages;
    const sortOrderNumber: number = input.sortOrder;
    return this.itemListDatasource
      .findItemList(pageNumber, sortOrderNumber)
      .pipe(
        switchMap((items) => {
          return items.length === 0
            ? throwError(() => new NotFoundException('Items not found'))
            : forkJoin([
                of(items),
                this.itemListDatasource.getTotalCount(),
                this.categoriesDatasource.findByCategories(
                  items.map((item) => item.id)
                ),
              ]).pipe(
                map(([items, totalCount, categories]) => {
                  console.log('Total count:', totalCount);
                  console.log('Categories found:', categories);
                  const builder = new ItemListOutputBuilder();
                  builder.items = items;
                  builder.totalCount = totalCount.count;
                  builder.categories = categories;
                  return builder.build();
                })
              );
        })
      );
  }
}
