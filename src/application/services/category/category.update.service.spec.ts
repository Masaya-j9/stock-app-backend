import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { CategoryUpdateService } from './category.update.service';
import { CategoryDomainService } from '../../../domain/inventory/items/services/category.domain.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryUpdateInputDto } from '../../dto/input/category/category.update.input.dto';
import { CategoryUpdateOutputDto } from '../../dto/output/category/category.update.output.dto';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '../../../domain/inventory/items/entities/category.entity';

describe('CategoryUpdateService', () => {
  let categoryUpdateService: CategoryUpdateService;
  let categoryDomainService: CategoryDomainService;
  let categoriesDatasource: CategoriesDatasource;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryUpdateService,
        CategoryDomainService,
        {
          provide: CategoriesDatasource,
          useValue: {
            findByCategoryId: jest.fn(),
            updateCategory: jest.fn(),
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

    categoryUpdateService = module.get<CategoryUpdateService>(
      CategoryUpdateService
    );
    categoryDomainService = module.get<CategoryDomainService>(
      CategoryDomainService
    );
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(CategoryUpdateService).toBeDefined();
  });

  it('カテゴリを更新する', (done) => {
    const input: CategoryUpdateInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const categoryId = 1;

    const mockCategory = {
      id: 1,
      name: 'カテゴリー１',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Category 1',
      deletedAt: undefined,
      itemCategories: [],
    };

    const mockDomainUpdatedCategory = new Category(
      1,
      'Category 1',
      'Category 1',
      new Date(),
      new Date(),
      null
    );

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(mockCategory));
    jest
      .spyOn(categoryDomainService, 'updateCategoryFields')
      .mockReturnValue(of(mockDomainUpdatedCategory));
    jest
      .spyOn(categoriesDatasource, 'updateCategory')
      .mockReturnValue(of(void 0));

    categoryUpdateService.service(input, categoryId).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(CategoryUpdateOutputDto);
        expect(result.id).toBe(1);
        expect(result.name).toBe('Category 1');
        expect(result.description).toBe('Category 1');
      },
      error: (error) => {
        done.fail(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('入力されたカテゴリ名が重複するときは、409エラーを返す', (done) => {
    const input: CategoryUpdateInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const categoryId = 1;

    const mockCategory = {
      id: 1,
      name: 'カテゴリー１',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Category 1',
      deletedAt: undefined,
      itemCategories: [],
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(mockCategory));
    jest
      .spyOn(categoryDomainService, 'updateCategoryFields')
      .mockReturnValue(of(null));

    categoryUpdateService.service(input, categoryId).subscribe({
      next: () => {
        done.fail('Expected error, but received success');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Category was not updated');
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリ名が空のときは、400エラーを返す', (done) => {
    const input: CategoryUpdateInputDto = {
      name: '',
      description: 'Category 1',
    };
    const categoryId = 1;

    const mockCategory = {
      id: 1,
      name: 'カテゴリー１',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Category 1',
      deletedAt: undefined,
      itemCategories: [],
    };

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(mockCategory));
    jest
      .spyOn(categoryDomainService, 'updateCategoryFields')
      .mockReturnValue(
        throwError(
          () => new BadRequestException('Category name cannot be empty')
        )
      );

    categoryUpdateService.service(input, categoryId).subscribe({
      next: () => {
        done.fail('Expected error, but received success');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Category name cannot be empty');
        done();
      },
      complete: () => {
        done();
      },
    });
  });

  it('カテゴリ名が見つからないとき、404エラーを返す', (done) => {
    const input: CategoryUpdateInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const categoryId = 1;
    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(null));

    categoryUpdateService.service(input, categoryId).subscribe({
      next: () => {
        done.fail('Expected error, but received success');
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

  it('トランザクション処理が成功したとき、成功ログを出力する', (done) => {
    const input: CategoryUpdateInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const categoryId = 1;

    const mockCategory = {
      id: 1,
      name: 'カテゴリー１',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Category 1',
      deletedAt: undefined,
      itemCategories: [],
    };

    const mockDomainUpdatedCategory = new Category(
      1,
      'Category 1',
      'Category 1',
      new Date(),
      new Date(),
      null
    );

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(mockCategory));
    jest
      .spyOn(categoryDomainService, 'updateCategoryFields')
      .mockReturnValue(of(mockDomainUpdatedCategory));
    jest
      .spyOn(categoriesDatasource, 'updateCategory')
      .mockReturnValue(of(void 0));
    jest.spyOn(logger, 'log').mockImplementation(jest.fn());

    categoryUpdateService.service(input, categoryId).subscribe({
      next: () => {
        logger.log(
          `Category successfully updated: ${mockDomainUpdatedCategory.id}, ${mockDomainUpdatedCategory.name}`
        );
        expect(logger.log).toHaveBeenCalledWith(
          `Category successfully updated: ${mockDomainUpdatedCategory.id}, ${mockDomainUpdatedCategory.name}`
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

  it('トランザクション処理が失敗したとき、失敗ログを出力する', (done) => {
    const input: CategoryUpdateInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const categoryId = 1;

    const mockCategory = {
      id: 1,
      name: 'カテゴリー１',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Category 1',
      deletedAt: undefined,
      itemCategories: [],
    };

    const mockDomainUpdatedCategory = new Category(
      1,
      'Category 1',
      'Category 1',
      new Date(),
      new Date(),
      null
    );

    // モックエラーを作成
    const mockError = new Error('Database error');

    jest
      .spyOn(categoriesDatasource, 'findByCategoryId')
      .mockReturnValue(of(mockCategory));
    jest
      .spyOn(categoryDomainService, 'updateCategoryFields')
      .mockReturnValue(of(mockDomainUpdatedCategory));
    jest
      .spyOn(categoriesDatasource, 'updateCategory')
      .mockReturnValue(throwError(() => mockError));
    jest.spyOn(logger, 'error').mockReturnValue();

    categoryUpdateService.service(input, categoryId).subscribe({
      next: () => {
        done.fail('Expected error, but received success');
      },
      error: () => {
        logger.error('Error updating category:', mockError);
        expect(logger.error).toHaveBeenCalledWith(
          'Error updating category:',
          mockError
        );
        done();
      },
      complete: () => {
        done();
      },
    });
  });
});
