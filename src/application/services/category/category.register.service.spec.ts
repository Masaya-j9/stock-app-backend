import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CategoryRegisterService } from './category.register.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryRegisterInputDto } from '../../../application/dto/input/category/category.register.input.dto';
import { CategoryRegisterOutputDto } from '../../../application/dto/output/category/category.register.output.dto';
import { Categories } from 'src/infrastructure/orm/entities/categories.entity';
import { ConflictException } from '@nestjs/common';

describe('CategoryRegisterService', () => {
  let categoryRegisterService: CategoryRegisterService;
  let categoriesDatasource: CategoriesDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRegisterService,
        {
          provide: CategoriesDatasource,
          useValue: {
            findCategoryByName: jest.fn(),
            createCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryRegisterService = module.get<CategoryRegisterService>(
      CategoryRegisterService
    );
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });
  it('should be defined', () => {
    expect(categoryRegisterService).toBeDefined();
  });

  it('カテゴリを登録する', (done) => {
    const input: CategoryRegisterInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const isUniqueCategory = undefined;

    jest
      .spyOn(categoriesDatasource, 'findCategoryByName')
      .mockReturnValue(of(isUniqueCategory));
    jest
      .spyOn(categoriesDatasource, 'createCategory')
      .mockReturnValue(of({ id: 1 }));

    categoryRegisterService.service(input).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(CategoryRegisterOutputDto);
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

  it('カテゴリ名が重複しているとき、409エラーを返す', (done) => {
    const input: CategoryRegisterInputDto = {
      name: 'Category 1',
      description: 'Category 1',
    };
    const isUniqueCategory: Categories = {
      id: 1,
      name: 'Category 1',
      description: 'Category 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      itemCategories: [],
    };

    jest
      .spyOn(categoriesDatasource, 'findCategoryByName')
      .mockReturnValue(of(isUniqueCategory));

    categoryRegisterService.service(input).subscribe({
      next: () => {
        done.fail('Expected error, but got success');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('This value is not unique');
        done();
      },
      complete: () => {
        done();
      },
    });
  });
});
