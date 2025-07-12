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
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemListServiceInterface } from '../../../application/services/item/item.list.interface';
import { ItemRegisterServiceInterface } from '../../../application/services/item/item.register.interface';
import { ItemUpdateServiceInterface } from '../../../application/services/item/item.update.interface';
import { ItemDeleteServiceInterface } from '../../../application/services/item/item.delete.interface';
import { ItemSingleServiceInterface } from '../../../application/services/item/item.single.interface';
import { DeletedItemListServiceInterface } from '../../../application/services/item/deleted.item.list.interface';
import { DeletedItemSingleServiceInterface } from '../../../application/services/item/deleted.item.single.interface';
import { ItemRestoreServiceInterface } from '../../../application/services/item/item.restore.interface';
import { UpdateItemQuantityServiceInterface } from '../../../application/services/item/update.item.quantity.interface';
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
import { DeletedItemListInputDto } from '../../../application/dto/input/item/deleted.item.list.input.dto';
import { DeletedItemListOutputDto } from '../../../application/dto/output/item/deleted.item.list.output.dto';
import { DeletedItemSingleInputDto } from '../../../application/dto/input/item/deleted.item.single.input.dto';
import { DeletedItemSingleOutputDto } from '../../../application/dto/output/item/deleted.item.single.output.dto';
import { ItemRestoreInputDto } from '../../../application/dto/input/item/item.restore.input.dto';
import { ItemRestoreOutputDto } from '../../../application/dto/output/item/item.restore.output.dto';
import { UpdateItemQuantityInputDto } from '../../../application/dto/input/item/update.item.quantity.input.dto';
import { UpdateItemQuantityOutputDto } from '../../../application/dto/output/item/update.item.quantity.output.dto';

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
    private readonly ItemSingleService: ItemSingleServiceInterface,
    @Inject('DeletedItemListServiceInterface')
    private readonly DeletedItemListService: DeletedItemListServiceInterface,
    @Inject('DeletedItemSingleServiceInterface')
    private readonly DeletedItemSingleService: DeletedItemSingleServiceInterface,
    @Inject('ItemRestoreServiceInterface')
    private readonly ItemRestoreService: ItemRestoreServiceInterface,
    @Inject('UpdateItemQuantityServiceInterface')
    private readonly UpdateItemQuantityService: UpdateItemQuantityServiceInterface
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
   * @param query - クエリ情報
   * @return {Observable<DeletedItemListOutputDto>} - 削除された物品の一覧情報を含むObservable
   */
  @ApiOperation({
    summary: '削除された物品の一覧を返すエンドポイント',
    description: '削除された物品の一覧を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: DeletedItemListOutputDto,
  })
  @Get('deleted')
  findDeletedItemList(
    @Query() query: DeletedItemListInputDto
  ): Observable<DeletedItemListOutputDto> {
    return this.DeletedItemListService.service(query);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<DeletedItemSingleOutputDto>} - 削除された物品の個別情報を含むObservable
   */
  @ApiOperation({
    summary: '削除された物品の個別情報を返すエンドポイント',
    description: '削除された物品の個別情報を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: DeletedItemSingleOutputDto,
  })
  @Get('deleted/:item_id')
  findDeletedItemSingle(
    @Param('item_id', ParseIntPipe) id: number
  ): Observable<DeletedItemSingleOutputDto> {
    const request: DeletedItemSingleInputDto = { id };
    return this.DeletedItemSingleService.service(request);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<ItemRestoreOutputDto>} - 復元された物品情報を含むObservable
   */
  @ApiOperation({
    summary: '削除された物品を復元するエンドポイント',
    description: '削除された物品を復元するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Restored',
    type: ItemRestoreOutputDto,
  })
  @Patch('restore/:item_id')
  restoreDeletedItem(
    @Param('item_id', ParseIntPipe) id: number
  ): Observable<ItemRestoreOutputDto> {
    const request: ItemRestoreInputDto = { id };
    return this.ItemRestoreService.service(request);
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

  @ApiOperation({
    summary: '物品の数量を更新するエンドポイント',
    description: '物品の数量を更新するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: UpdateItemQuantityOutputDto,
  })
  @Patch('quantity/:item_id')
  updateItemQuantity(
    @Param('item_id', ParseIntPipe) itemId: number,
    @Body() body: UpdateItemQuantityInputDto
  ): Observable<UpdateItemQuantityOutputDto> {
    return this.UpdateItemQuantityService.service(body, itemId);
  }
}
