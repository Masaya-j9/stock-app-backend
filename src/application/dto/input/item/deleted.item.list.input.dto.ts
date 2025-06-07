import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Min, Max, IsOptional } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

const PAGE_MIN = 1;
const SORT_ORDER_MIN = 0;
const SORT_ORDER_MAX = 1;

export class DeletedItemListInputDto implements InputDto {
  @ApiProperty({
    example: 1,
    description: 'ページ番号(1以上の整数とする)',
    type: Number,
  })
  @IsOptional()
  @Min(PAGE_MIN)
  pages?: number;

  @ApiProperty({
    example: 0,
    description: '並べ替え順 0=昇順, 1=降順',
    type: Number,
  })
  @IsOptional()
  @Min(SORT_ORDER_MIN)
  @Max(SORT_ORDER_MAX)
  @Transform(({ value }) => Number(value))
  @Expose({ name: 'sort_order' })
  sortOrder?: number;
}
