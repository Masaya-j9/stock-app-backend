import { Controller, Get, Inject } from '@nestjs/common';
import { StockListServiceInterface } from 'src/application/services/stock/stock.list.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockListInputDto } from "src/application/dto/input/stock/stock.list.input.dto";
import { StockListOutputDto } from "src/application/dto/output/stock/stock.list.output.dto";

@ApiTags('stock-app')
@Controller()
export class StockListController {
  constructor(
    @Inject('StockListServiceInterface')
    private readonly StockListService: StockListServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<StockListInputDto>}
   */

  @ApiOperation({
    summary: ''
  })
}