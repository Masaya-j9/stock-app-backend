import { Category } from './category.entity';

export class Item {
  private readonly _id: number;
  private _name: string;
  private _quantity: number;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;
  private readonly _categories: Category[];

  constructor(
    id: number,
    name: string,
    quantity: number,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    categories: Category[]
  ) {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
    this._categories = categories;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get quantity(): number {
    return this._quantity;
  }

  get description(): string {
    return this._description;
  }

  get categories(): Category[] {
    return this._categories;
  }
}
