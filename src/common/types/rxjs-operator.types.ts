import { Items } from '../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../infrastructure/orm/entities/categories.entity';
import { Category } from '../../domain/inventory/items/entities/category.entity';
import { OperatorFunction } from 'rxjs';

export type ItemNotFoundOperator = OperatorFunction<Items | undefined, Items>;

export type ItemListNotFoundOperator = OperatorFunction<
  Items[] | undefined,
  Items[]
>;

export type CategoryNotFoundOperator = OperatorFunction<
  Categories | undefined,
  Categories
>;

export type CategoriesNotFoundOperator = OperatorFunction<
  Categories[] | undefined,
  Categories[]
>;

export type CategoryIdsNotFoundOperator = OperatorFunction<
  number[] | undefined,
  number[]
>;

export type ItemNameUniqueOperator = OperatorFunction<
  Items | undefined,
  Items | undefined
>;

export type CategoryUpdateConflictOperator = OperatorFunction<
  Category | null | undefined,
  Category
>;
