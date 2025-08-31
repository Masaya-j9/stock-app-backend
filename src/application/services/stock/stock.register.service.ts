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
import { StockRegisterServiceInterface } from './stock.register.interface';
import { StockRegisterInputDto } from '../../dto/input/stock/stock.register.input.dto';
import { ItemCreatedEvent } from '../item/events/item.created.event.publisher.interface';
import {
  ITEMS_DATASOURCE_TOKEN,
  ItemsDatasourceInterface,
} from '../../../infrastructure/datasources/items/items.datasource.interface';

import {
  StocksDatasourceInterface,
  STOCKS_DATASOURCE_TOKEN,
} from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { EventSource, EVENT_SOURCE_TO_STATUS } from './constants/event.sources';
import { Stock } from '../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../domain/inventory/stocks/entities/stock.status.entity';
import { Quantity } from '../../../domain/inventory/items/value-objects/quantity';
import { StockRegisterOutputDto } from '../../dto/output/stock/stock.register.output.dto';
import { StockRegisterOutputDtoBuilder } from '../../dto/output/stock/stock.register.output.builder';
import {
  ItemNotFoundOperator,
  StockStatusNotFoundOperator,
} from 'src/common/types/rxjs-operator.types';
import { Items } from 'src/infrastructure/orm/entities/items.entity';
import { StockStatuses } from 'src/infrastructure/orm/entities/stock.statuses.entity';

@Injectable()
export class StockRegisterService implements StockRegisterServiceInterface {
  private readonly logger = new Logger(StockRegisterService.name);

  constructor(
    @Inject(STOCKS_DATASOURCE_TOKEN)
    public readonly stocksDatasource: StocksDatasourceInterface,
    @Inject(ITEMS_DATASOURCE_TOKEN)
    public readonly itemsDatasource: ItemsDatasourceInterface
  ) {}

  /**
   * Input DTOを使用して在庫を登録する
   * @param inputDto - 在庫登録用Input DTO
   * @returns StockRegisterOutputDto
   */
  service(inputDto: StockRegisterInputDto): Observable<StockRegisterOutputDto> {
    const event = inputDto.toItemCreatedEvent();
    const eventSource = inputDto.eventSource;

    this.logger.log(
      `Registering stock for item ID: ${event.id} from source: ${eventSource}`
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
        })
      ),
      switchMap(({ item, status, statusName }) => {
        return of({ item, status, event }).pipe(
          map(({ item, status, event }) =>
            this.createStockEntity(item, status, event)
          ),
          tap((stockEntity) =>
            this.logger.log(
              `Created stock entity with UUID: ${stockEntity.id}, isPersisted: ${stockEntity.isPersisted()}`
            )
          ),
          switchMap((stockEntity) =>
            this.persistStockEntity(stockEntity).pipe(
              map((persistedStockEntity) => ({
                persistedStockEntity,
                item,
                statusName,
              }))
            )
          )
        );
      }),
      map(({ persistedStockEntity, item, statusName }) => {
        const outputDto = new StockRegisterOutputDtoBuilder(
          persistedStockEntity,
          item
        ).build();

        return { outputDto, statusName };
      }),
      tap({
        next: ({ outputDto, statusName }) =>
          this.logger.log(
            `Stock registered successfully for item ID: ${event.id} with status: ${statusName}, final stock ID: ${outputDto.id}`
          ),
        error: (error) =>
          this.logger.error(
            `Failed to register stock for item ${event.id}: ${error.message}`
          ),
      }),
      map(({ outputDto }) => outputDto)
    );
  }

  private determineStockStatus(eventSource: EventSource): string | undefined {
    return EVENT_SOURCE_TO_STATUS[eventSource];
  }

  /**
   * Stock entityを作成する
   * @param item - アイテム情報
   * @param status - ステータス情報
   * @param event - アイテム作成イベント
   * @returns Stock entity
   */
  private createStockEntity(
    item: Items,
    status: StockStatuses,
    event: Pick<ItemCreatedEvent, 'id' | 'quantity' | 'description'>
  ): Stock {
    return Stock.create(
      item.id,
      Quantity.of(event.quantity),
      event.description || '',
      new StockStatus(
        status.id,
        status.name,
        status.description || '',
        status.createdAt,
        status.updatedAt,
        status.deletedAt
      )
    );
  }

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
   * Stock entityを永続化する（stockIdを使ってドメインエンティティ構築）
   * @param stockEntity - 永続化するStockエンティティ（UUID付き）
   * @returns Observable<Stock> - 永続化されたStockエンティティ（DB ID付き）
   */
  private persistStockEntity(stockEntity: Stock): Observable<Stock> {
    this.logger.log(
      `Persisting stock entity with UUID: ${stockEntity.id}, hasTemporaryUUID: ${stockEntity.hasTemporaryUUID()}`
    );

    const persistenceData = this.extractPersistenceData(stockEntity);

    return this.stocksDatasource
      .createStockWithStatusIdInTransaction(
        persistenceData.itemId,
        persistenceData.quantity,
        persistenceData.statusId,
        persistenceData.description
      )
      .pipe(
        switchMap((stockId) => {
          const persistedStock = new Stock(
            stockId, // 永続化されたDB ID
            stockEntity.quantity,
            stockEntity.description,
            new Date(), // 永続化時の時刻
            new Date(), // 永続化時の時刻
            null, // deletedAt
            stockEntity.itemId,
            stockEntity.status
          );

          return of(persistedStock);
        }),
        tap((persistedStock) =>
          this.logger.log(
            `Stock persisted successfully. Original UUID: ${stockEntity.id} → DB ID: ${persistedStock.id}, isPersisted: ${persistedStock.isPersisted()}`
          )
        )
      );
  }

  private extractPersistenceData(stockEntity: Stock) {
    return {
      itemId: stockEntity.itemId!,
      quantity: stockEntity.quantity.value(),
      statusId: stockEntity.status!.id,
      description: stockEntity.description,
    };
  }
}
