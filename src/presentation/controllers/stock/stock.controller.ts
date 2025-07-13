import { Controller, Get, Query, Inject } from '@nestjs/common';
import { StockListServiceInterface } from '../../../application/services/stock/stock.list.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockListInputDto } from '../../../application/dto/input/stock/stock.list.input.dto';
import { StockListOutputDto } from '../../../application/dto/output/stock/stock.list.output.dto';

@ApiTags('stocks')
@Controller('stocks')
export class StockController {
  constructor(
    @Inject('StockListServiceInterface')
    private readonly StockListService: StockListServiceInterface
  ) {}

  /**
   * @param query - クエリ情報
   * @return {Observable<StockListOutputDto>} - 登録されている在庫の一覧情報を含むObservable
   */
  @ApiOperation({
    summary: '登録されている在庫一覧を返すエンドポイント',
    description: '10件ずつ登録されている在庫情報を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: StockListOutputDto,
  })
  @Get()
  findStockList(
    @Query() query: StockListInputDto
  ): Observable<StockListOutputDto> {
    return this.StockListService.service(query);
  }
}
