import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * 物品のカテゴリ情報を取得する際のリクエスト情報を表すDTO
 */

const PAGE_MIN: number = 1;

export class CategoryListInputDto implements InputDto {
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
}
