export class Item {
  private readonly _id: number;
  private readonly _name: string;
  private readonly _quantity: number;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;
  private readonly _categoryIds: number[];

  constructor(
    id: number,
    name: string,
    quantity: number,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    categoryIds: number[]
  ) {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
    this._categoryIds = categoryIds;
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

  get categoryIds(): number[] {
    return this._categoryIds;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  static create(
    name: string,
    quantity: number,
    description: string,
    categoryIds: number[]
  ): Item {
    return new Item(
      0,
      name,
      quantity,
      description,
      new Date(),
      new Date(),
      null,
      categoryIds
    );
  }
}
