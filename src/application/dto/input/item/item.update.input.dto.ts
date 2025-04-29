import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayUnique,
} from 'class-validator';

const ITEM_NAME_MIN_LENGTH: number = 1;
const ITEM_NAME_MAX_LENGTH: number = 255;
const ITEM_QUANTITY_MIN: number = 1;
const ITEM_QUANTITY_MAX: number = 1000;

export class ItemUpdateInputDto implements InputDto {
  @ApiProperty({
    example: '物品名',
    description: '物品名に関する名称',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(ITEM_NAME_MIN_LENGTH)
  @MaxLength(ITEM_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({
    example: 1,
    description: '登録する物品の個数',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(ITEM_QUANTITY_MIN)
  @Max(ITEM_QUANTITY_MAX)
  quantity: number;

  @ApiProperty({
    example: '物品の説明',
    description: '物品の説明',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(ITEM_NAME_MIN_LENGTH)
  @MaxLength(ITEM_NAME_MAX_LENGTH)
  description: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'カテゴリーIDを配列で複数うけとる',
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  categoryIds: number[];
}
