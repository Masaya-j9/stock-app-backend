import { Quantity } from '../value-objects/quantity';
import { TextAmount } from '../value-objects/text.amount';
import { categoryDiff } from '../types/category.diff.type';

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

  validateUpdate(
    name?: string,
    quantity?: number,
    description?: string
  ): boolean {
    //未定義の場合
    if (
      name === undefined ||
      quantity === undefined ||
      description === undefined
    ) {
      return false;
    }

    //値オブジェクトを使ったビジネスロジックのチェック
    try {
      Quantity.of(quantity);
      TextAmount.of(name);
      TextAmount.of(description);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * itemのカテゴリを更新する際のカテゴリの差分を取得するメソッド
   * @param newCategoryIds - 入力されたカテゴリIDの配列
   * @returns categoryDiff - 追加差分のカテゴリIDと削除差分カテゴリIDの配列
   */
  getCategoryDiff(newCategoryIds: number[]): categoryDiff {
    const currentSet = new Set(this._categoryIds);
    const newSet = new Set(newCategoryIds);

    const addIds = newCategoryIds.filter((id) => !currentSet.has(id));
    const deleteIds = this._categoryIds.filter((id) => !newSet.has(id));

    return {
      addCategoryIds: addIds,
      deleteCategoryIds: deleteIds,
    };
  }

  static update(
    currentItem: Item,
    name: string,
    quantity: number,
    description: string,
    categoryIds: number[]
  ): Item | null {
    if (!currentItem.validateUpdate(name, quantity, description)) {
      console.log('itemは更新できません');
      return null;
    }

    // すべての値が同じ場合（カテゴリも含めて）だけnullを返す
    const isNameSame = name === currentItem._name;
    const isQuantitySame = quantity === currentItem._quantity;
    const isDescriptionSame = description === currentItem._description;
    const isCategorySame =
      currentItem._categoryIds.length === categoryIds.length &&
      currentItem._categoryIds.every((id, idx) => id === categoryIds[idx]);

    if (isNameSame && isQuantitySame && isDescriptionSame && isCategorySame) {
      return null;
    }

    const { addCategoryIds: addIds, deleteCategoryIds: deleteIds } =
      currentItem.getCategoryDiff(categoryIds);

    const updatedCategoryIds = [
      ...currentItem.categoryIds.filter((id) => !deleteIds.includes(id)),
      ...addIds,
    ];

    return new Item(
      currentItem._id,
      name,
      quantity,
      description,
      currentItem._createdAt,
      new Date(),
      null,
      updatedCategoryIds
    );
  }

  delete(): Item {
    return new Item(
      this._id,
      this._name,
      this._quantity,
      this._description,
      this._createdAt,
      this._updatedAt,
      new Date(),
      this._categoryIds
    );
  }

  restore(): Item {
    return new Item(
      this._id,
      this._name,
      this._quantity,
      this._description,
      this._createdAt,
      new Date(),
      null,
      this._categoryIds
    );
  }
}
