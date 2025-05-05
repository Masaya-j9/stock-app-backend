import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemRegisterServiceInterface } from '../../../application/services/item/item.register.interface';
import { ItemUpdateServiceInterface } from '../../../application/services/item/item.update.interface';
import { ItemDeleteServiceInterface } from '../../../application/services/item/item.delete.interface';
import { ItemSingleServiceInterface } from '../../../application/services/item/item.single.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { ItemRegisterInputDto } from '../../../application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from '../../../application/dto/output/item/item.register.output.dto';
import { ItemUpdateInputDto } from '../../../application/dto/input/item/item.update.input.dto';
import { ItemUpdateOutputDto } from '../../../application/dto/output/item/item.update.output.dto';
import { ItemDeleteInputDto } from '../../../application/dto/input/item/item.delete.input.dto';
import { ItemDeleteOutputDto } from '../../../application/dto/output/item/item.delete.output.dto';
import { ItemSingleInputDto } from '../../../application/dto/input/item/item.single.input.dto';
import { ItemSingleOutputDto } from '../../../application/dto/output/item/item.single.output.dto';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(
    @Inject('ItemListServiceInterface')
    private readonly ItemListService: ItemListServiceInterface,
    @Inject('ItemRegisterServiceInterface')
    private readonly ItemRegisterService: ItemRegisterServiceInterface,
    @Inject('ItemUpdateServiceInterface')
    private readonly ItemUpdateService: ItemUpdateServiceInterface,
    @Inject('ItemDeleteServiceInterface')
    private readonly ItemDeleteService: ItemDeleteServiceInterface,
    @Inject('ItemSingleServiceInterface')
    private readonly ItemSingleService: ItemSingleServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemListInputDto>} - 登録されている物品の一覧情報を含むObservable
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
   * @return {Observable<ItemRegisterOutputDto>} - 登録する物品情報を含むObservable
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

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemUpdateOutputDto>} - 更新された物品情報を含むObservable
   */
  @ApiOperation({
    summary: '物品を更新するエンドポイント',
    description: '物品を更新するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: ItemUpdateOutputDto,
  })
  @Patch(':item_id')
  updateItem(
    @Param('item_id', ParseIntPipe) itemId: number,
    @Body() body: ItemUpdateInputDto
  ): Observable<ItemUpdateOutputDto> {
    return this.ItemUpdateService.service(body, itemId);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemDeleteOutputDto>} - 削除された物品情報を含むObservable
   */
  @Delete(':item_id')
  @ApiOperation({
    summary: '物品を論理削除するエンドポイント',
    description: '物品を削除するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted',
    type: ItemDeleteOutputDto,
  })
  deleteItem(
    @Param('item_id', ParseIntPipe) itemId: number
  ): Observable<ItemDeleteOutputDto> {
    const request: ItemDeleteInputDto = { itemId };
    return this.ItemDeleteService.service(request);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemSingleOutputDto>} - 物品情報を含むObservable
   */
  @ApiOperation({
    summary: '単一の物品を取得するエンドポイント',
    description: '単一の物品を取得するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ItemSingleOutputDto,
  })
  @Get(':item_id')
  findItemSingle(
    @Param('item_id', ParseIntPipe) itemId: number
  ): Observable<ItemSingleOutputDto> {
    const request: ItemSingleInputDto = { itemId };
    return this.ItemSingleService.service(request);
  }
}
