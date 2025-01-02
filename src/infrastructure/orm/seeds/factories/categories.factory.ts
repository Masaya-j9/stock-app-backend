import { setSeederFactory } from 'typeorm-extension';
import { Categories } from '../../entities/categories.entity';

const categoryData = [
  { name: 'ガジェット', description: 'ガジェットに関するカテゴリ' },
  { name: '書籍', description: '書籍に関するカテゴリ' },
  { name: '家具', description: '家具に関するカテゴリ' },
  { name: 'その他', description: 'その他のカテゴリ' },
];

export const CategoriesFactory = setSeederFactory(Categories, () => {
  const newCategory = new Categories();
  const category = categoryData.shift(); // 順番にデータを取得
  if (category) {
    newCategory.name = category.name;
    newCategory.description = category.description;
    newCategory.createdAt = new Date();
    newCategory.updatedAt = new Date();
  }
  return newCategory;
});
