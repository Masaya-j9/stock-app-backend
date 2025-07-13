import { StockListInputDto } from 'src/application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from 'src/application/dto/output/stock/stock.list.output.dto';
import { ApplicationService } from '../application.service';
import { StocksDatasource } from '../../../infrastructure/datasources/stocks/stocks.datasource';
import { ItemsDatasource } from '../../../infrastructure/datasources/items/items.datasource';

export interface StockListServiceInterface
  extends ApplicationService<StockListInputDto, StockListOutputDto> {
  stocksDatasource: StocksDatasource;
  itemsDatasource: ItemsDatasource;
}
