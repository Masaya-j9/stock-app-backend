import { OutputBuilder } from '../../output/output.builder';
import { CategoryDeleteOutputDto } from './category.delete.output.dto';

export class CategoryDeleteOutputBuilder
  implements OutputBuilder<CategoryDeleteOutputDto>
{
  private _id: number;
  private _name: string;
  private _description: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date;

  constructor(
    id: number,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
  }
  build(): CategoryDeleteOutputDto {
    return (() => {
      const output = new CategoryDeleteOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.description = this._description;
      output.createdAt = this._createdAt;
      output.updatedAt = this._updatedAt;
      output.deletedAt = this._deletedAt;
      return output;
    })();
  }
}
