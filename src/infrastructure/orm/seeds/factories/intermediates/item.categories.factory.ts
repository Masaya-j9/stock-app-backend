import { setSeederFactory } from 'typeorm-extension';
import { ItemCategories } from '../../../entities/intermediates/item.categories.entity';
import { Items } from '../../../entities/items.entity';
import { Categories } from '../../../entities/categories.entity';

export const ItemCategoriesFactory = setSeederFactory(ItemCategories, () => {
  const itemCategories = new ItemCategories();
  itemCategories.item = new Items();
  itemCategories.category = new Categories();
  itemCategories.item.id = 1;
  itemCategories.category.id = 1;
  itemCategories.createdAt = new Date();
  itemCategories.updatedAt = new Date();
  itemCategories.deletedAt = undefined;

  return itemCategories;
});
