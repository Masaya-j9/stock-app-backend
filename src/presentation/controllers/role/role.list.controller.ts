import { Controller, Get, Inject } from '@nestjs/common';
import { RoleListServiceInterface } from 'src/application/services/role/role.list.interface';
import { Observable } from 'rxjs';
import { RoleListInputDto } from 'src/application/dto/input/role/role.list.input.dto';
import { RoleListOutputDto } from 'src/application/dto/output/role/role.list.output.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('stock-app')
@Controller()
export class RoleListController {
  constructor(
    @Inject('RoleListServiceInterface')
    private readonly RoleListService: RoleListServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<RoleListOutputDto>} - 登録されている会員プランに関する一覧情報を含むObeservable
   */

  @ApiOperation({
    summary: '会員プランに関する情報を返すエンドポイント',
    description: '会員プランの一覧情報返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: RoleListOutputDto,
  })
  @Get('/roles')
  @ApiBody({
    type: RoleListInputDto,
  })
  getRoleList(): Observable<RoleListInputDto> {
    return this.RoleListService.service(RoleListInputDto);
  }
}
