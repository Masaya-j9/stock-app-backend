import { Injectable } from '@nestjs/common';
import { StockListServiceInterface } from './stock.list.interface';
import { Observable } from 'rxjs';
import { StockListInputDto } from 'src/application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from 'src/application/dto/output/stock/stock.list.output.dto';

@Injectable()
export class StockListService implements StockListServiceInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  service(input: StockListInputDto): Observable<StockListOutputDto> {
    return null;
  }
}
