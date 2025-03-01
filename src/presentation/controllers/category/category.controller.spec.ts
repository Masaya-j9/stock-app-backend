import { Test, TestingModule } from '@nestjs/testing';
import { CategoryListController } from './category.controller';
import { CategoryListService } from '../../../application/services/category/category.list.service';
import { CategoryListServiceInterface } from '../../../application/services/category/category.list.interface';
import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../../application/dto/output/category/category.list.output.dto';
import { CategoryRegisterService } from '../../../application/services/category/category.register.service';
import { CategoryRegisterInputDto } from '../../../application/dto/input/category/category.register.input.dto';
import { CategoryRegisterOutputDto } from '../../../application/dto/output/category/category.register.output.dto';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { of, throwError } from 'rxjs';
import { BadRequestException, ConflictException } from '@nestjs/common';
describe('CategoryController', () => {
  let controller: CategoryListController;
  let categoryListService: CategoryListServiceInterface;
  let categoryRegisterService: CategoryRegisterService;
  let categoriesDatasource: CategoriesDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryListController],
      providers: [
        CategoryListService, // 実際のサービスを提供
        CategoryRegisterService,
        {
          provide: 'CategoryListServiceInterface',
          useClass: CategoryListService, // インターフェースを実装するクラスを提供
        },
        {
          provide: 'CategoryRegisterServiceInterface',
          useClass: CategoryRegisterService,
        },
        {
          provide: CategoriesDatasource,
          useValue: {
            findCategoryList: jest.fn(() => of([])),
            findCategoryByName: jest.fn(() => of(undefined)),
            createCategory: jest.fn(() => of({})),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryListController>(CategoryListController);
    categoryListService = module.get<CategoryListServiceInterface>(
      'CategoryListServiceInterface'
    );
    categoryRegisterService = module.get<CategoryRegisterService>(
      CategoryRegisterService
    );
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
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

  describe('registerCategory', () => {
    it('カテゴリを登録する', (done) => {
      const input: CategoryRegisterInputDto = {
        name: 'Category 1',
        description: 'カテゴリー1についての説明',
      };

      const mockNewCategory: CategoryRegisterOutputDto = {
        id: 1,
        name: 'Category 1',
        description: 'カテゴリー1についての説明',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(categoriesDatasource, 'createCategory')
        .mockReturnValue(of({ id: 1 }));
      jest
        .spyOn(categoryRegisterService, 'service')
        .mockReturnValue(of(mockNewCategory));

      controller.registerCategory(input).subscribe({
        next: (result) => {
          expect(result).toMatchObject({
            id: result.id,
            name: result.name,
            description: result.description,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          });
        },
        error: (error) => {
          done(error);
        },
        complete: () => {
          done();
        },
      });
    });

    it('カテゴリ名が重複している場合、409エラーを返す', (done) => {
      const input: CategoryRegisterInputDto = {
        name: 'Category 1',
        description: 'カテゴリー1についての説明',
      };

      jest.spyOn(categoriesDatasource, 'findCategoryByName').mockReturnValue(
        of({
          id: 1,
          name: 'Category 1',
          description: 'Existing category description',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          itemCategories: [],
        })
      );
      controller.registerCategory(input).subscribe({
        next: () => {
          done.fail('Expected an error, but got a result');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(ConflictException);
          expect(error.message).toBe('This value is not unique');
          expect(error.response.statusCode).toBe(409);
          expect(categoriesDatasource.findCategoryByName).toHaveBeenCalledWith(
            input.name
          );
          done();
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
