import { CategoryDeleteOutputBuilder } from './category.delete.output.builder';
import { CategoryDeleteOutputDto } from './category.delete.output.dto';

describe('CategoryDeleteOutputBuilder', () => {
  it('CategoryDeleteOutputDto をビルドすることができること', () => {
    // テストデータを準備
    const id = 1;
    const name = 'Test Category';
    const description = 'Test Description';
    const createdAt = new Date('2025-03-20T08:51:00.000Z');
    const updatedAt = new Date('2025-03-20T08:51:00.000Z');
    const deletedAt = new Date('2025-03-20T08:51:00.000Z');

    const builder = new CategoryDeleteOutputBuilder(
      id,
      name,
      description,
      createdAt,
      updatedAt,
      deletedAt
    );
    const result = builder.build();
    expect(result).toBeInstanceOf(CategoryDeleteOutputDto);
    expect(result.id).toBe(id);
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.createdAt).toBe(createdAt);
    expect(result.updatedAt).toBe(updatedAt);
    expect(result.deletedAt).toBe(deletedAt);
  });
});
