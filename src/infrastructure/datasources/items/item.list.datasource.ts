import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Item } from '../../../domain/inventory/items/entities/item.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { from, map, Observable } from 'rxjs';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';

@Injectable()
export class ItemListDatasource {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}
  /**
   * 登録されている物品の一覧を取得する
   * @param {ItemListInputDto} query - リクエスト情報
   * @return {Observable<ItemListOutputDto>} - 登録されている物品の一覧情報
   *
   */
  //queryBuilderを使って、ページ番号を元に、10件ずつ取得する。
  // findItemList(page: number, sortOrderNumber: number): Observable<Item[]> {
  //   const pagination = Pagination.of(page);
  //   const sortOrder = SortOrder.of(sortOrderNumber);
  //   console.log('sortOrderNumber:', sortOrderNumber);

  //   return from(
  //     this.dataSource
  //       .createQueryBuilder()
  //       .select([
  //         'items.id AS id',
  //         'items.name AS name',
  //         'items.quantity AS quantity',
  //         'items.description AS description',
  //         'items.createdAt AS createdAt',
  //         'items.updatedAt AS updatedAt',
  //       ])
  //       .from(
  //         (qb) =>
  //           qb
  //             .select('id')
  //             .from('items', 'items')
  //             .where('items.deletedAt IS NULL')
  //             .orderBy('items.id', sortOrder.isDescending())
  //             .offset(pagination.offset())
  //             .limit(pagination.itemsPerPage()),
  //         'sub'
  //       )
  //       .innerJoin('items', 'items', 'items.id = sub.id')
  //       .orderBy('items.id', sortOrder.toQuerySort())
  //       .getRawMany()
  //   );
  // }

  findItemList(page: number, sortOrderNumber: number): Observable<Item[]> {
    const pagination = Pagination.of(page);
    const sortOrder = SortOrder.of(sortOrderNumber);
    console.log('sortOrderNumber:', sortOrderNumber);

    // サブクエリを作成
    const subQuery = this.dataSource
      .createQueryBuilder()
      .select('id')
      .from('items', 'items')
      .where('items.deletedAt IS NULL')
      .orderBy('items.id', 'ASC')
      .offset(pagination.offset())
      .limit(pagination.itemsPerPage());

    // サブクエリの内容をログに出力
    const [query, parameters] = subQuery.getQueryAndParameters();
    console.log('Subquery:', query);
    console.log('Parameters:', parameters);

    return from(
      this.dataSource
        .createQueryBuilder()
        .select([
          'items.id AS id',
          'items.name AS name',
          'items.quantity AS quantity',
          'items.description AS description',
          'items.createdAt AS createdAt',
          'items.updatedAt AS updatedAt',
        ])
        .from('items', 'items')
        .innerJoin(`(${subQuery.getQuery()})`, 'sub', 'items.id = sub.id')
        .setParameters(subQuery.getParameters())
        .orderBy('items.id', sortOrder.toQuerySort())
        .getRawMany()
    );
  }
  getTotalCount(): Observable<{ count: number }> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(items.id)', 'count')
        .from('items', 'items')
        .getRawOne()
    ).pipe(
      map((result) => ({ count: Number(result.count) })) // `count` を数値化
    );
  }
}
