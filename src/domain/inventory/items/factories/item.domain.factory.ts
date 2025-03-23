import { Item } from '../entities/item.entity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { ItemAndCategoryType } from '../../../../infrastructure/types/item.and.category.type';

export class ItemDomainFactory {
  static fromInfrastructure(
    item: Items, // 修正: items -> item
    itemIdsAndCategoryIds: ItemAndCategoryType[]
  ): Item {
    const categoryIds = itemIdsAndCategoryIds
      .filter((itemCategory) => itemCategory.itemId === item.id)
      .map((itemCategory) => itemCategory.categoryId);

    return new Item(
      item.id,
      item.name,
      item.quantity,
      item.description,
      item.createdAt,
      item.updatedAt,
      item.deletedAt,
      categoryIds
    );
  }
}
