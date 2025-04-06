import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemRegisterServiceInterface } from '../../../application/services/item/item.register.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { ItemRegisterInputDto } from '../../../application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from '../../../application/dto/output/item/item.register.output.dto';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(
    @Inject('ItemListServiceInterface')
    private readonly ItemListService: ItemListServiceInterface,
    @Inject('ItemRegisterServiceInterface')
    private readonly ItemRegisterService: ItemRegisterServiceInterface
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
  @Get()
  findItemList(
    @Query() query: ItemListInputDto
  ): Observable<ItemListOutputDto> {
    return this.ItemListService.service(query);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemRegisterOutputDto>} - 登録する物品情報を含むObervable
   */
  @ApiOperation({
    summary: '物品を登録するエンドポイント',
    description: '物品を登録するAPI',
  })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: ItemRegisterOutputDto,
  })
  @Post()
  registerItem(
    @Body() body: ItemRegisterInputDto
  ): Observable<ItemRegisterOutputDto> {
    return this.ItemRegisterService.service(body);
  }
}
