import { OutputBuilder } from '../output.builder';
import { CategoryUpdateOutputDto } from './category.update.output.dto';

export class CategoryUpdateOutputBuilder
  implements OutputBuilder<CategoryUpdateOutputDto>
{
  private _id: number;
  private _name: string;
  private _description: string;
  private _updatedAt: Date;

  constructor(id: number, name: string, description: string, updatedAt: Date) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._updatedAt = updatedAt;
  }

  build(): CategoryUpdateOutputDto {
    return (() => {
      const output = new CategoryUpdateOutputDto();
      output.id = this._id;
      output.name = this._name;
      output.description = this._description;
      output.updatedAt = this._updatedAt;
      return output;
    })();
  }
}
