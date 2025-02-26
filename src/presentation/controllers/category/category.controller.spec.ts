import { Test, TestingModule } from '@nestjs/testing';
import { CategoryListController } from './category.controller';
import { CategoryListService } from '../../../application/services/category/category.list.service';
import { CategoryListServiceInterface } from '../../../application/services/category/category.list.interface';
import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../../application/dto/output/category/category.list.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryListController;
  let categoryListService: CategoryListServiceInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryListController],
      providers: [
        CategoryListService, // 実際のサービスを提供
        {
          provide: 'CategoryListServiceInterface',
          useClass: CategoryListService, // インターフェースを実装するクラスを提供
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findCategoryList: jest.fn(() => of([])),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryListController>(CategoryListController);
    categoryListService = module.get<CategoryListServiceInterface>(
      'CategoryListServiceInterface'
    );
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findCategoryList', () => {
    it('レスポンスが返却されること', (done) => {
      const input: CategoryListInputDto = {
        pages: 1,
      };
      const mockCategories: CategoryListOutputDto = {
        count: 2,
        categories: [
          {
            id: 1,
            name: 'Category 1',
            description: 'カテゴリ−１についての説明',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            name: 'Category 2',
            description: 'カテゴリー2についての説明',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(categoryListService, 'service')
        .mockReturnValue(of(mockCategories));

      controller.findCategoryList(input).subscribe({
        next: (result) => {
          expect(result).toBe(mockCategories);
          expect(categoryListService.service).toHaveBeenCalledWith(input);
        },
        error: (error) => {
          done(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('pagesが不正の値の場合、400番エラーを返す', (done) => {
      const input: CategoryListInputDto = {
        pages: -1,
      };
      jest
        .spyOn(categoryListService, 'service')
        .mockReturnValue(
          throwError(() => new BadRequestException('Invalid pages'))
        );
      controller.findCategoryList(input).subscribe({
        next: () => {
          done.fail('Expected an error, but got a result');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toBe('Invalid pages');
          expect(error.response.statusCode).toBe(400);
          expect(categoryListService.service).toHaveBeenCalledWith(input);
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
