import { Test, TestingModule } from '@nestjs/testing';
import { CategoryDomainService } from './category.domain.service';
import { Category } from '../entities/category.entity';

describe('CategoryDomainService', () => {
  let categoryDomainService: CategoryDomainService;
  let categoryEntity: Category;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryDomainService],
    }).compile();

    categoryDomainService = module.get<CategoryDomainService>(
      CategoryDomainService
    );
    categoryEntity = new Category(
      1,
      'Category 1',
      'Category 1',
      new Date(),
      new Date(),
      null
    );
  });

  it('カテゴリ情報を更新する', (done) => {
    expect(categoryDomainService).toBeDefined();
    const newName = 'New Name';
    const newDescription = 'New Description';

    jest
      .spyOn(categoryEntity, 'update')
      .mockReturnValue(
        new Category(
          categoryEntity.id,
          newName,
          newDescription,
          categoryEntity.createdAt,
          new Date(),
          categoryEntity.deletedAt
        )
      );

    categoryDomainService
      .updateCategoryFields(categoryEntity, newName, newDescription)
      .subscribe({
        next: (result) => {
          expect(categoryEntity.update).toHaveBeenCalledWith(
            newName,
            newDescription
          );
          expect(result).toBeInstanceOf(Category);
          expect(result?.name).toBe(newName);
          expect(result?.description).toBe(newDescription);
        },
        error: (error) => {
          done.fail(error);
        },
        complete: () => {
          done();
        },
      });
  });
});
