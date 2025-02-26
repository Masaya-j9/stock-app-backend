import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CategoryListServiceInterface } from '../../../application/services/category/category.list.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../../application/dto/output/category/category.list.output.dto';

@ApiTags('categories')
@Controller()
export class CategoryListController {
  constructor(
    @Inject('CategoryListServiceInterface')
    private readonly CategoryListService: CategoryListServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<CategoryListOutputDto>} - 登録されているカテゴリーの一覧情報を含むObservable
   */
  @Get('categories')
  @ApiOperation({
    summary: '登録されているカテゴリー一覧を返すエンドポイント',
    description: '10件ずつ登録されているカテゴリー情報を返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: CategoryListOutputDto,
  })
  findCategoryList(
    @Query() query: CategoryListInputDto
  ): Observable<CategoryListOutputDto> {
    return this.CategoryListService.service(query);
  }
}
