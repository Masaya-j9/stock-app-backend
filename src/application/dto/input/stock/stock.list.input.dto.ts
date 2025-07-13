import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, Max } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

/*
 * 在庫一覧を取得する際のリクエスト情報を表すDTO
 */
const PAGE_MIN: number = 1;
const SORT_ORDER_MIN: number = 0;
const SORT_ORDER_MAX: number = 1;

export class StockListInputDto implements InputDto {
  @ApiProperty({
    example: 1,
    description: `
    ページ番号(1以上の整数とする)
    1ページあたりの取得件数は10件とする
    `,
    type: Number,
  })
  @IsOptional()
  @Min(PAGE_MIN)
  @Expose({ name: 'pages' })
  pages?: number;

  @ApiProperty({
    example: 0,
    description: `
    並べ替え順
    0: 昇順(省略された場合はデフォルトとする)
    1: 降順
    `,
    type: Number,
  })
  @IsOptional()
  @Min(SORT_ORDER_MIN)
  @Max(SORT_ORDER_MAX)
  @Transform(({ value }) => Number(value))
  @Expose({ name: 'sort_order' })
  sortOrder?: number;
}
