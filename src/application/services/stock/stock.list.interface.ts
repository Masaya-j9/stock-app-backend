import { StockListInputDto } from 'src/application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from 'src/application/dto/output/stock/stock.list.output.dto';
import { ApplicationService } from '../application.service';
import { StocksDatasourceInterface } from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';
import { ItemsDatasourceInterface } from '../../../infrastructure/datasources/items/items.datasource.interface';

/**
 * 在庫一覧サービスのインターフェース
 * 抽象化されたデータソースインターフェースに依存
 */
export interface StockListServiceInterface
  extends ApplicationService<StockListInputDto, StockListOutputDto> {
  stocksDatasource: StocksDatasourceInterface;
  itemsDatasource: ItemsDatasourceInterface;
}
