import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Items } from '../../orm/entities/items.entity';
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
  findItemList(page: number, sortOrderNumber: number): Observable<Items[]> {
    const pagination = Pagination.of(page);
    const sortOrder = SortOrder.of(sortOrderNumber);

    const subQuery = this.dataSource
      .createQueryBuilder()
      .select('id')
      .from('items', 'items')
      .where('items.deletedAt IS NULL')
      .orderBy('items.id', 'ASC')
      .offset(pagination.offset())
      .limit(pagination.itemsPerPage());

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

  getTotalCount(itemsIds: number[]): Observable<number> {
    return from(
      this.dataSource
        .createQueryBuilder()
        .select('COUNT(items.id)', 'count')
        .from('items', 'items')
        .where('items.id IN (:...itemsIds)', { itemsIds })
        .getRawOne()
    ).pipe(map((result) => Number(result.count)));
  }
}
