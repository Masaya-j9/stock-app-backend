import { StockUpdateInputDto } from '../../dto/input/stock/stock.update.input.dto';
import { StockUpdateOutputDto } from '../../dto/output/stock/stock.update.output.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasourceInterface } from '../../../infrastructure/datasources/items/items.datasource.interface';
import { StocksDatasourceInterface } from '../../../infrastructure/datasources/stocks/stocks.datasource.interface';

/**
 * 在庫更新サービスのインターフェース
 * 在庫更新Input Dtoを受け取って在庫を更新し、適切なステータスを設定する
 */
export interface StockUpdateServiceInterface
  extends ApplicationService<StockUpdateInputDto, StockUpdateOutputDto> {
  stocksDatasource: StocksDatasourceInterface;
  itemsDatasource: ItemsDatasourceInterface;
}
