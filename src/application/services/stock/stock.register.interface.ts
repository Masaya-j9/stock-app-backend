import { StockRegisterOutputDto } from '../../dto/output/stock/stock.register.output.dto';
import { StockRegisterInputDto } from '../../dto/input/stock/stock.register.input.dto';
import { ApplicationService } from '../application.service';
import { ItemsDatasourceInterface } from 'src/infrastructure/datasources/items/items.datasource.interface';
import { StocksDatasourceInterface } from 'src/infrastructure/datasources/stocks/stocks.datasource.interface';

/**
 * 在庫登録サービスのインターフェース
 * 在庫登録Input DTOを受け取って在庫を登録し、適切なステータスを設定する
 */
export interface StockRegisterServiceInterface
  extends ApplicationService<StockRegisterInputDto, StockRegisterOutputDto> {
  stocksDatasource: StocksDatasourceInterface;
  itemsDatasource: ItemsDatasourceInterface;
}
