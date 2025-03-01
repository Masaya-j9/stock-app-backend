import { OutputBuilder } from '../output.builder';
import { CategoryRegisterOutputDto } from './category.register.output.dto';

export class CategoryRegisterOutputBuilder
  implements OutputBuilder<CategoryRegisterOutputDto>
{
  private _id: number;
  private _name: string;
  private _description: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: number,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  build(): CategoryRegisterOutputDto {
    return (() => {
      const output = new CategoryRegisterOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.description = this._description;
      output.createdAt = this._createdAt;
      output.updatedAt = this._updatedAt;
      return output;
    })();
  }
}
