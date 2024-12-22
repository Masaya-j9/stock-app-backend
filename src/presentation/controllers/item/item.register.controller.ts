import { Controller, Post, Inject, Body } from '@nestjs/common';
import { ItemRegisterServiceInterface } from 'src/application/services/item/item.register.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ItemRegisterInputDto } from 'src/application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from 'src/application/dto/output/item/item.register.output.dto';

@ApiTags('stock-app')
@Controller()
export class ItemRegisterController {
  constructor(
    @Inject('ItemRegisterServiceInterface')
    private readonly ItemRegisterService: ItemRegisterServiceInterface
  ) {}

  /**
   * @param body - 物品情報
   * @param request - リクエスト情報
   * @returns {Observable<ItemRegisterInputDto>}
   */

  @ApiOperation({
    summary: '物品情報を登録するときのエンドポイント',
    description: '入力された商品情報',
  })
  @ApiResponse({
    status: 201,
    description: 'OK',
    type: ItemRegisterOutputDto,
  })
  @Post('/item/:item_id')
  @ApiBody({
    type: ItemRegisterInputDto,
  })
  registerItem(
    @Body() body: any
    // @Req() request: Request
  ): Observable<ItemRegisterInputDto> {
    const itemRegisterInput = plainToInstance(ItemRegisterInputDto, body);
    return this.ItemRegisterService.service(itemRegisterInput);
  }
}
