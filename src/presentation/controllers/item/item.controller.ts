import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ItemListServiceInterface } from 'src/application/services/item/item.list.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    description: '10件ずつ登録されている物品情報を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ItemListOutputDto,
  })
  @Get('/items/')
  findItemList(
    @Query() query: ItemListInputDto
  ): Observable<ItemListOutputDto> {
    console.log('Received query params:', query); // 追加
    console.log('query.pages:', query.pages); // 追加
    console.log('query.sortOrder:', query.sortOrder); // 追加
    return this.ItemListService.service(query);
  }
}
