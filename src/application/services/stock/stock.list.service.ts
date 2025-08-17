import {
  map,
  Observable,
  switchMap,
  of,
  forkJoin,
  filter,
  defaultIfEmpty,
  mergeMap,
  throwError,
} from 'rxjs';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { StockListServiceInterface } from './stock.list.interface';
import { StockListInputDto } from '../../dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from '../../dto/output/stock/stock.list.output.dto';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import {
  ItemsDatasourceInterface,
  ITEMS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/items/items.datasource.interface';
import { StockListOutputBuilder } from '../../dto/output/stock/stock.list.output.builder';
import { Stocks } from '../../../infrastructure/orm/entities/stocks.entity';
import { Items } from '../../../infrastructure/orm/entities/items.entity';
import { Pagination } from '../../../domain/common/value-objects/pagination';
import { SortOrder } from '../../../domain/common/value-objects/sort/sort.order';
import {
  StockListNotFoundOperator,
  ItemListNotFoundOperator,
} from '../../../common/types/rxjs-operator.types';
import { StockDomainFactory } from '../../../domain/inventory/stocks/factories/stock.domain.factory';

@Injectable()
export class StockListService implements StockListServiceInterface {
  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    public readonly stocksDatasource: StocksDatasourceInterface,
    @Inject(ITEMS_DATASOURCE_TOKEN)
    public readonly itemsDatasource: ItemsDatasourceInterface
  ) {}

  /**
   * 登録されている在庫の一覧を取得する
   * @param {StockListInputDto} input - リクエスト情報
   * @returns{Observable<StockListOutputDto>} - 登録されている在庫の一覧情報を含むObservableオブジェクト
   *
   * @throws {HttpException} 在庫が見つからない場合、404エラーをスローします。
   */
  service(input: StockListInputDto): Observable<StockListOutputDto> {
    const pagination = Pagination.of(input.pages);
    const sortOrder = SortOrder.of(input.sortOrder);

    return this.stocksDatasource
      .findStockList(pagination, sortOrder)
      .pipe(this.throwIfStocksNotFound())
      .pipe(
        switchMap((stocks: Stocks[]) => {
          return forkJoin([
            of(stocks),
            this.itemsDatasource
              .findItemsByIds(this.extractItemIds(stocks))
              .pipe(this.throwIfItemsNotFound()),
            this.stocksDatasource.countAll(),
          ]);
        }),
        map(([stocks, items, totalStockCount]) => {
          const domainStocks =
            StockDomainFactory.fromInfrastructureList(stocks);

          return new StockListOutputBuilder(
            domainStocks,
            items,
            stocks.length,
            pagination.calcTotalPages(totalStockCount)
          ).build();
        })
      );
  }

  private throwIfStocksNotFound = (): StockListNotFoundOperator => (source$) =>
    source$.pipe(
      filter((stocks: Stocks[]) => stocks.length > 0),
      defaultIfEmpty(undefined),
      mergeMap((stocks) =>
        stocks
          ? [stocks]
          : throwError(() => new NotFoundException('Stocks not found'))
      )
    );

  private throwIfItemsNotFound = (): ItemListNotFoundOperator => (source$) =>
    source$.pipe(
      filter((items: Items[]) => items.length > 0),
      defaultIfEmpty(undefined),
      mergeMap((items) =>
        items
          ? [items]
          : throwError(() => new NotFoundException('Items not found'))
      )
    );

  private extractItemIds(stocks: Stocks[]): number[] {
    return stocks
      .map((stock) => stock.item?.id)
      .filter((itemId) => itemId !== null && itemId !== undefined) as number[];
  }
}
