import {
  Observable,
  tap,
  switchMap,
  map,
  forkJoin,
  throwError,
  of,
  filter,
  defaultIfEmpty,
  mergeMap,
} from 'rxjs';
import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { StockUpdateServiceInterface } from './stock.update.service.interface';
import { StockUpdateInputDto } from '../../dto/input/stock/stock.update.input.dto';
import { ItemUpdatedEvent } from '../item/events/item.updated.event.publisher.interface';
import {
  ITEMS_DATASOURCE_TOKEN,
  ItemsDatasourceInterface,
} from '../../../infrastructure/datasources/items/items.datasource.interface';
import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { EventSource, EVENT_SOURCE_TO_STATUS } from './constants/event.sources';
import { StockUpdateOutputDtoBuilder } from '../../dto/output/stock/stock.update.output.builder';
import { StockUpdateOutputDto } from 'src/application/dto/output/stock/stock.update.output.dto';
import {
  ItemNotFoundOperator,
  StockStatusNotFoundOperator,
} from 'src/common/types/rxjs-operator.types';
import { Items } from 'src/infrastructure/orm/entities/items.entity';
import { StockStatuses } from 'src/infrastructure/orm/entities/stock.statuses.entity';
import { Stock } from '../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../domain/inventory/stocks/entities/stock.status.entity';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import { Stocks } from '../../../infrastructure/orm/entities/stocks.entity';

@Injectable()
export class StockUpdateService implements StockUpdateServiceInterface {
  private readonly logger = new Logger(StockUpdateService.name);

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    public readonly stocksDatasource: StocksDatasourceInterface,
    @Inject(ITEMS_DATASOURCE_TOKEN)
    public readonly itemsDatasource: ItemsDatasourceInterface
  ) {}

  service(input: StockUpdateInputDto): Observable<StockUpdateOutputDto> {
    const event = input.toItemUpdatedEvent();
    const eventSource = input.eventSource;
    this.logger.log(
      `Updating stock for item ID: ${event.id} from source: ${eventSource}`
    );

    return of(eventSource).pipe(
      map((source) => this.determineStockStatus(source)),
      this.throwIfInvalidEventSource(eventSource),
      switchMap((statusName) =>
        forkJoin({
          item: this.itemsDatasource
            .findItemById(event.id)
            .pipe(this.throwIfItemNotFound()),
          status: this.stocksDatasource
            .getStatusByName(statusName)
            .pipe(this.throwIfStockStatusesNotFound()),
          statusName: of(statusName),
          currentStock: this.stocksDatasource.findCurrentStockByItemId(
            event.id
          ),
        })
      ),
      switchMap(({ item, status, currentStock }) =>
        this.updateStockEntity(item, status, event, currentStock).pipe(
          switchMap((updatedStock) => {
            this.logger.log(
              `Stock updated successfully for item ID: ${item.id}`
            );
            // 更新されたStockエンティティを永続化
            return this.persistUpdatedStockEntity(updatedStock).pipe(
              map((persistedStock) =>
                new StockUpdateOutputDtoBuilder(persistedStock, item).build()
              )
            );
          })
        )
      )
    );
  }

  private determineStockStatus(eventSource: EventSource): string | undefined {
    return EVENT_SOURCE_TO_STATUS[eventSource];
  }

  private throwIfInvalidEventSource =
    (eventSource: EventSource) => (source$: Observable<string | undefined>) =>
      source$.pipe(
        filter((statusName): statusName is string => !!statusName),
        defaultIfEmpty(null),
        mergeMap((statusName) => {
          if (!statusName) {
            this.logger.error(`Unknown event source: ${eventSource}`);
            return throwError(
              () => new Error(`Unknown event source: ${eventSource}`)
            );
          }
          return of(statusName);
        })
      );

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

  private throwIfStockStatusesNotFound =
    (): StockStatusNotFoundOperator => (source$) =>
      source$.pipe(
        filter(
          (status: StockStatuses | null): status is StockStatuses => !!status
        ),
        defaultIfEmpty(null),
        mergeMap((status) =>
          status
            ? [status]
            : throwError(() => new NotFoundException('Stock status not found'))
        )
      );

  /**
   * 既存のStock entityを取得して更新する
   * @param item - アイテム情報
   * @param status - ステータス情報
   * @param event - アイテム更新イベント
   * @param currentStock - 現在の在庫情報（ORMエンティティ）
   * @returns Observable<Stock> - 更新されたStock entity
   */
  private updateStockEntity(
    item: Items,
    status: StockStatuses,
    event: Pick<ItemUpdatedEvent, 'id' | 'quantity' | 'description'>,
    currentStock?: Stocks
  ): Observable<Stock> {
    if (!currentStock) {
      return throwError(() => new NotFoundException('Current stock not found'));
    }

    const currentStockEntity = this.convertStocksToStockEntity(
      currentStock,
      item.id,
      status
    );

    const updateQuantity = Quantity.of(event.quantity);
    const updateDescription = event.description;
    const updateStatus = new StockStatus(
      status.id,
      status.name,
      status.description,
      status.createdAt,
      status.updatedAt,
      status.deletedAt
    );

    const updatedStock = Stock.update(
      currentStockEntity,
      updateQuantity,
      updateDescription,
      updateStatus
    );

    return of(updatedStock);
  }

  /**
   * ORMのStocksエンティティをドメインのStockエンティティに変換
   * @param stocksEntity - ORMエンティティ
   * @param statusEntity - ステータス情報（StockStatuses）
   * @returns Stock - ドメインエンティティ
   */
  private convertStocksToStockEntity(
    stocksEntity: Stocks,
    itemId: number,
    statusEntity: StockStatuses
  ): Stock {
    const stockStatus = new StockStatus(
      statusEntity.id,
      statusEntity.name,
      statusEntity.description || '',
      statusEntity.createdAt,
      statusEntity.updatedAt,
      statusEntity.deletedAt
    );

    return new Stock(
      stocksEntity.id,
      Quantity.of(stocksEntity.quantity),
      stocksEntity.description || '',
      stocksEntity.createdAt,
      stocksEntity.updatedAt,
      stocksEntity.deletedAt,
      itemId,
      stockStatus
    );
  }

  /**
   * 更新されたStock entityを永続化する
   * @param stockEntity - 更新されたStockエンティティ
   * @returns Observable<Stock> - 永続化されたStockエンティティ
   */
  private persistUpdatedStockEntity(stockEntity: Stock): Observable<Stock> {
    this.logger.log(
      `Persisting updated stock entity with ID: ${stockEntity.id}`
    );

    const persistenceData = this.extractPersistenceData(stockEntity);

    return this.stocksDatasource
      .updateStockQuantityByIdWithStatus(
        persistenceData.itemId,
        persistenceData.quantity,
        persistenceData.description,
        persistenceData.statusName
      )
      .pipe(
        map((updatedStocksEntity) => {
          // 永続化されたエンティティをドメインエンティティに変換
          return new Stock(
            updatedStocksEntity.id,
            Quantity.of(updatedStocksEntity.quantity),
            updatedStocksEntity.description || '',
            updatedStocksEntity.createdAt,
            updatedStocksEntity.updatedAt,
            updatedStocksEntity.deletedAt,
            updatedStocksEntity.item?.id || null,
            updatedStocksEntity.status
              ? new StockStatus(
                  updatedStocksEntity.status.id,
                  updatedStocksEntity.status.name,
                  updatedStocksEntity.status.description || '',
                  updatedStocksEntity.status.createdAt,
                  updatedStocksEntity.status.updatedAt,
                  updatedStocksEntity.status.deletedAt
                )
              : null
          );
        }),
        tap((persistedStock) =>
          this.logger.log(
            `Stock updated successfully. ID: ${persistedStock.id}, isPersisted: ${persistedStock.isPersisted()}`
          )
        )
      );
  }

  /**
   * Stock entityから永続化用データを抽出する
   * @param stockEntity - Stockエンティティ
   * @returns 永続化用データ
   */
  private extractPersistenceData(stockEntity: Stock) {
    return {
      itemId: stockEntity.itemId!,
      quantity: stockEntity.quantity.value(),
      statusName: stockEntity.status!.name,
      description: stockEntity.description,
    };
  }
}
