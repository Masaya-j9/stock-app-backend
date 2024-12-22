import { StockListInputDto } from 'src/application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from 'src/application/dto/output/stock/stock.list.output.dto';
import { ApplicationService } from '../application.service';

export interface StockListServiceInterface
  extends ApplicationService<StockListInputDto, StockListOutputDto> {}
