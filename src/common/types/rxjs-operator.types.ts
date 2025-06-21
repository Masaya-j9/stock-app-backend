import { Items } from '../../infrastructure/orm/entities/items.entity';
import { Categories } from '../../infrastructure/orm/entities/categories.entity';
import { OperatorFunction } from 'rxjs';

export type ItemNotFoundOperator = OperatorFunction<Items | undefined, Items>;

export type CategoriesNotFoundOperator = OperatorFunction<
  Categories[] | undefined,
  Categories[]
>;
