import { Controller, Get, Inject } from '@nestjs/common';
import { ItemListServiceInterface } from 'src/application/services/item/item.list.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemListInputDto } from 'src/application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from 'src/application/dto/output/item/item.list.output.dto';

@ApiTags('stock-app')
@Controller()
export class ItemListController {
  constructor(
    @Inject('ItemListServiceInterface')
    private readonly ItemListService: ItemListServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemListInputDto>} - 登録されている物品の一覧情報を含むObervable
   */

  @ApiOperation({
    summary: '登録されている物品一覧を返すエンドポイント',
    description: '10件ずつ登録されいている物品情報を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ItemListOutputDto,
  })
  @Get('/items')
  @ApiBody({
    type: ItemListInputDto,
  })
  findItemList(): Observable<ItemListOutputDto> {
    return this.ItemListService.service(ItemListInputDto);
  }
}
