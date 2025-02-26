import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CategoryListService } from './category.list.service';
import { CategoriesDatasource } from '../../../infrastructure/datasources/categories/categories.datasource';
import { CategoryListInputDto } from '../../../application/dto/input/category/category.list.input.dto';
import { CategoryListOutputDto } from '../../../application/dto/output/category/category.list.output.dto';
import { Categories } from '../../../infrastructure/orm/entities/categories.entity';

describe('CategoryListService', () => {
  let categoryListService: CategoryListService;
  let categoriesDatasource: CategoriesDatasource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryListService,
        {
          provide: CategoriesDatasource,
          useValue: {
            findCategoryList: jest.fn(),
            getTotalCount: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryListService = module.get<CategoryListService>(CategoryListService);
    categoriesDatasource =
      module.get<CategoriesDatasource>(CategoriesDatasource);
  });

  it('should be defined', () => {
    expect(categoryListService).toBeDefined();
  });

  it('登録されているカテゴリ一覧を取得する', (done) => {
    const input: CategoryListInputDto = {
      pages: 1,
    };
    const mockCategories: Categories[] = [
      {
        id: 1,
        name: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: '',
        deletedAt: undefined,
        itemCategories: [],
      },
      {
        id: 2,
        name: 'Category 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: '',
        deletedAt: undefined,
        itemCategories: [],
      },
    ];
    const mockTotalCount: number = 2;

    jest
      .spyOn(categoriesDatasource, 'findCategoryList')
      .mockReturnValue(of(mockCategories));

    categoryListService.service(input).subscribe({
      next: (result) => {
        expect(result).toBeInstanceOf(CategoryListOutputDto);
        expect(result.count).toBe(mockTotalCount);
        expect(result.categories.length).toBe(2);
        expect(result.categories).toHaveLength(mockCategories.length);
      },
      error: (error) => {
        done.fail(error);
      },
      complete: () => {
        done();
      },
    });
  });

  it('取得するカテゴリが0件の場合、404を返す', (done) => {
    const input: CategoryListInputDto = {
      pages: 1,
    };
    const mockCategories: Categories[] = [];

    jest
      .spyOn(categoriesDatasource, 'findCategoryList')
      .mockReturnValue(of(mockCategories));

    categoryListService.service(input).subscribe({
      next: () => {
        done.fail('エラーが発生しませんでした');
      },
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Categories not found');
        done();
      },
      complete: () => {
        done.fail('エラーが発生しませんでした');
      },
    });
  });
});
