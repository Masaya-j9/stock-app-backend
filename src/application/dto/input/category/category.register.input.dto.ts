import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const CATEGORY_NAME_MIN_LENGTH: number = 1;
const CATEGORY_NAME_MAX_LENGTH: number = 255;

export class CategoryRegisterInputDto implements InputDto {
  @ApiProperty({
    example: 'カテゴリー名',
    description: 'カテゴリー名',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(CATEGORY_NAME_MIN_LENGTH)
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({
    example: 'カテゴリーの説明',
    description: 'カテゴリーの説明',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(CATEGORY_NAME_MIN_LENGTH)
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  description: string;
}
