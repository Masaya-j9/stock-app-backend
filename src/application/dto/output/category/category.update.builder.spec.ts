import { CategoryUpdateOutputBuilder } from './category.update.builder';
import { CategoryUpdateOutputDto } from './category.update.output.dto';

describe('CategoryUpdateOutputBuilder', () => {
  it('CategoryUpdateOutputDto をビルドすることができること', () => {
    // テストデータを準備
    const id = 1;
    const name = 'Test Category';
    const description = 'Test Description';
    const updatedAt = new Date('2025-03-20T08:51:00.000Z');

    // CategoryUpdateOutputBuilderインスタンスを作成
    const builder = new CategoryUpdateOutputBuilder(
      id,
      name,
      description,
      updatedAt
    );

    // build() メソッドを実行して、DTOを取得
    const result = builder.build();

    // 結果がCategoryUpdateOutputDtoのインスタンスであることを確認
    expect(result).toBeInstanceOf(CategoryUpdateOutputDto);

    // 各プロパティが正しい値であることを確認
    expect(result.id).toBe(id);
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.updatedAt).toBe(updatedAt);
  });

  it('異なるデータで CategoryUpdateOutputDto を正しくビルドできること', () => {
    // 異なるテストデータを準備
    const id = 2;
    const name = 'Another Category';
    const description = 'Another Description';
    const updatedAt = new Date('2025-03-21T09:00:00.000Z');

    // CategoryUpdateOutputBuilderインスタンスを作成
    const builder = new CategoryUpdateOutputBuilder(
      id,
      name,
      description,
      updatedAt
    );

    // build() メソッドを実行して、DTOを取得
    const result = builder.build();

    // 結果がCategoryUpdateOutputDtoのインスタンスであることを確認
    expect(result).toBeInstanceOf(CategoryUpdateOutputDto);

    // 各プロパティが正しい値であることを確認
    expect(result.id).toBe(id);
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.updatedAt).toBe(updatedAt);
  });
});
