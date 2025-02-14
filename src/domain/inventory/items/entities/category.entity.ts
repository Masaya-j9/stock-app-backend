export class Category {
  private readonly _id: number;
  private _name: string;
  private readonly _description: string;
  private readonly _itemId: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;

  constructor(
    id: number,
    name: string,
    description: string,
    itemId: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._itemId = itemId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get itemId(): number {
    return this._itemId;
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
}
