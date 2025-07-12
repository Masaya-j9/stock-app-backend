import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

const ITEM_QUANTITY_MIN: number = 1;

export class UpdateItemQuantityInputDto implements InputDto {
  @ApiProperty({
    example: 1,
    description: '増減する個数',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(ITEM_QUANTITY_MIN)
  quantity: number;
}
