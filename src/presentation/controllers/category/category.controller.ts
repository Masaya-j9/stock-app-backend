import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoryListServiceInterface } from '../../../application/services/category/category.list.interface';
import { CategoryRegisterServiceInterface } from '../../../application/services/category/category.register.interface';
import { CategoryUpdateServiceInterface } from '../../../application/services/category/category.update.interface';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../../application/dto/output/category/category.list.output.dto';
import { CategoryRegisterInputDto } from '../../../application/dto/input/category/category.register.input.dto';
import { CategoryRegisterOutputDto } from '../../../application/dto/output/category/category.register.output.dto';
import { CategoryUpdateInputDto } from '../../../application/dto/input/category/category.update.input.dto';
import { CategoryUpdateOutputDto } from '../../../application/dto/output/category/category.update.output.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryListController {
  constructor(
    @Inject('CategoryListServiceInterface')
    private readonly CategoryListService: CategoryListServiceInterface,
    @Inject('CategoryRegisterServiceInterface')
    private readonly CategoryRegisterService: CategoryRegisterServiceInterface,
    @Inject('CategoryUpdateServiceInterface')
    private readonly CategoryUpdateService: CategoryUpdateServiceInterface
  ) {}

  /**
   * @param request - リクエスト情報
   * @return {Observable<CategoryListOutputDto>} - 登録されているカテゴリーの一覧情報を含むObservable
   */
  @Get()
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

  /**
   * @param request - リクエスト情報
   * @return {Observable<CategoryRegisterOutputDto>} - カテゴリ情報を含むObservable
   */
  @Post()
  @ApiOperation({
    summary: 'カテゴリ情報を1件登録するエンドポイント',
    description: 'カテゴリ情報を1件登録するAPI',
  })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: CategoryRegisterOutputDto,
  })
  registerCategory(
    @Body() body: CategoryRegisterInputDto
  ): Observable<CategoryRegisterOutputDto> {
    return this.CategoryRegisterService.service(body);
  }

  /**
   * @param request - リクエスト情報
   * @return {Observable<CategoryUpdateOutputDto>} - カテゴリ情報を含むObservable
   */
  @Patch(':category_id')
  @ApiOperation({
    summary: 'カテゴリ情報を1件更新するエンドポイント',
    description: 'カテゴリ情報を1件更新するAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: CategoryUpdateOutputDto,
  })
  updateCategory(
    @Param('category_id') categoryId: number,
    @Body() body: CategoryUpdateInputDto
  ): Observable<CategoryUpdateOutputDto> {
    return this.CategoryUpdateService.service(body, categoryId);
  }
}
