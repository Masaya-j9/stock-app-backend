import { Quantity } from '../../items/value-objects/quantity';

export class Stock {
  private readonly _id: number;
  private readonly _quantity: Quantity;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;
  private readonly _itemId: number | null;

  constructor(
    id: number,
    quantity: Quantity,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    itemId: number | null
  ) {
    this._id = id;
    this._quantity = quantity;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
    this._itemId = itemId;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get description(): string {
    return this._description;
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

  get itemId(): number | null {
    return this._itemId;
  }
}
