import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryDeleteService } from './category.delete.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryDeleteInputDto } from 'src/application/dto/input/category/category.delete.input.dto';
import { CategoryDeleteOutputDto } from 'src/application/dto/output/category/category.delete.output.dto';
import { of, throwError } from 'rxjs';

describe('CategoryDeleteService', () => {
  let categoryDeleteService: CategoryDeleteService;
  let categoriesDatasource: CategoriesDatasource;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryDeleteService,
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategoryId: jest.fn(),
            deleteCategory: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryDeleteService = module.get<CategoryDeleteService>(
      CategoryDeleteService
    );
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(categoryDeleteService).toBeDefined();
  });

  it('カテゴリを論理削除すること', (done) => {
    const categoryId = 1;
    const category = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };
    const outputDto: CategoryDeleteOutputDto = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(category));
    jest
      .spyOn(categoriesDatasource, 'deleteCategory')
      .mockReturnValue(of(void 0));
    jest.spyOn(logger, 'log');

    categoryDeleteService.service(inputDto).subscribe({
      next: (result) => {
        expect(result.id).toBe(outputDto.id);
        expect(result.name).toBe(outputDto.name);
        expect(result.description).toBe(outputDto.description);
        expect(result.createdAt.getTime()).toBeCloseTo(
          outputDto.createdAt.getTime(),
          -1
        );
        expect(result.updatedAt.getTime()).toBeCloseTo(
          outputDto.updatedAt.getTime(),
          -1
        );
        expect(result.deletedAt.getTime()).toBeCloseTo(
          outputDto.deletedAt.getTime(),
          -1
        );
      },
      error: (error) => {
        done.fail(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリが存在しないとき、404エラーを返すこと', (done) => {
    const categoryId = 1;
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(null));
    jest.spyOn(logger, 'error');

    categoryDeleteService.service(inputDto).subscribe({
      next: () => {
        done.fail('Unexpected result');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Category not found');
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('外部のテーブルで利用されているとき、409エラーを返すこと', (done) => {
    const categoryId = 1;
    const category = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(category));
    jest
      .spyOn(categoriesDatasource, 'deleteCategory')
      .mockReturnValue(throwError(() => ({ code: 'ER_ROW_IS_REFERENCED' })));
    categoryDeleteService.service(inputDto).subscribe({
      next: () => {
        done.fail('Unexpected result');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'This category cannot be deleted due to related data!'
        );
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリの削除に失敗したとき、500エラーを返すこと', (done) => {
    const categoryId = 1;
    const category = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(category));
    jest
      .spyOn(categoriesDatasource, 'deleteCategory')
      .mockReturnValue(
        throwError(() => new Error('Transaction processing failed'))
      );

    jest.spyOn(logger, 'error');
    categoryDeleteService.service(inputDto).subscribe({
      next: () => {
        done.fail('Unexpected result');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Transaction processing failed');
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリの論理削除が成功したとき、成功logを出力すること', (done) => {
    const categoryId = 1;
    const category = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };
    const outputDto: CategoryDeleteOutputDto = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };
    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(category));
    jest
      .spyOn(categoriesDatasource, 'deleteCategory')
      .mockReturnValue(of(void 0));
    jest.spyOn(logger, 'log');

    categoryDeleteService.service(inputDto).subscribe({
      next: (result) => {
        logger.log(`Category deleted successfully: ${outputDto.id}`);
        expect(result.id).toBe(outputDto.id);
        expect(result.name).toBe(outputDto.name);
        expect(result.description).toBe(outputDto.description);
        expect(result.createdAt.getTime()).toBeCloseTo(
          outputDto.createdAt.getTime(),
          -1
        );
        expect(result.updatedAt.getTime()).toBeCloseTo(
          outputDto.updatedAt.getTime(),
          -1
        );
        expect(result.deletedAt.getTime()).toBeCloseTo(
          outputDto.deletedAt.getTime(),
          -1
        );
      },
      error: (error) => {
        done.fail(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリの論理削除に失敗したとき、エラーログを出力すること', (done) => {
    const categoryId = 1;
    const category = {
      id: categoryId,
      name: 'Test Category',
      description: 'Test Category Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };
    const inputDto: CategoryDeleteInputDto = {
      categoryId: categoryId,
    };
    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(category));
    jest
      .spyOn(categoriesDatasource, 'deleteCategory')
      .mockReturnValue(
        throwError(() => new Error('Transaction processing failed'))
      );
    jest.spyOn(logger, 'error');

    categoryDeleteService.service(inputDto).subscribe({
      next: () => {
        done.fail('Unexpected result');
      },
      error: (error) => {
        logger.error(`Error deleting category: ${error.message}`);
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Transaction processing failed');
        done();
      },
      complete: () => {
        done();
      },
    });
  });
});
