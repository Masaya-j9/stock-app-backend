import { Unique } from '../../../common/value-objects/unique';
export class Category {
  private readonly _id: number;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt: Date | null;

  constructor(
    id: number,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
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

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  validateUpdate(name?: string, description?: string): boolean {
    // 未定義の場合
    if (name === undefined || description === undefined) {
      return false;
    }

    // 変更がない場合
    if (name === this._name && description === this._description) {
      return false;
    }

    //名前が重複している場合
    if (name !== this._name) {
      const uniqueName = Unique.of(name, this._name);
      if (uniqueName.isDuplicate(this._name)) {
        return false;
      }
    }

    // 説明が重複している場合
    if (description !== this._description) {
      const uniqueDescription = Unique.of(description, this._description);
      if (uniqueDescription.isDuplicate(this._description)) {
        return false;
      }
    }

    return true;
  }

  update(name?: string, description?: string): Category | null {
    // 更新処理をしない場合
    if (!this.validateUpdate(name, description)) {
      return null;
    }

    // 変更すべきフィールドを格納
    let updatedName: string = this._name;
    let updatedDescription: string = this._description;

    if (name) updatedName = name;
    if (description) updatedDescription = description;

    if (
      updatedName !== this._name ||
      updatedDescription !== this._description
    ) {
      return new Category(
        this._id,
        updatedName,
        updatedDescription,
        this._createdAt,
        new Date(),
        this._deletedAt
      );
    }

    return null;
  }

  delete(): Category {
    return this._deletedAt !== null
      ? this
      : new Category(
          this._id,
          this._name,
          this._description,
          this._createdAt,
          new Date(),
          new Date()
        );
  }
}
