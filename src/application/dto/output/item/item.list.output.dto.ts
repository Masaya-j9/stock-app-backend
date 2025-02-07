import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class itemCategories {
  @ApiProperty({
    example: 1,
    description: `
    カテゴリーID
    `,
    type: Number,
  })
  @Expose({ name: 'id' })
  id: number;

  @ApiProperty({
    example: 'テストカテゴリー',
    description: `
    カテゴリー名
    `,
    type: String,
  })
  @Expose({ name: 'name' })
  name: string;
}

export class ItemResults {
  @ApiProperty({
    example: 1,
    description: `
    物品ID
    `,
    type: Number,
  })
  @Expose({ name: 'id' })
  id: number;

  @ApiProperty({
    example: 'テスト物品',
    description: `
    物品名
    `,
    type: String,
  })
  @Expose({ name: 'name' })
  name: string;

  @ApiProperty({
    example: 1,
    description: `
    物品数
    `,
    type: Number,
  })
  @Expose({ name: 'quantity' })
  quantity: number;

  @ApiProperty({
    example: 'この物品はテスト用です。',
    description: `
    物品の詳細
    `,
    type: String,
  })
  @Expose({ name: 'description' })
  description: string;

  @ApiProperty({
    example: 1,
    description: `
    カテゴリーID
    `,
    type: Number,
  })
  @Expose({ name: 'Category' })
  itemsCategories: itemCategories[];
}

export class ItemListOutputDto implements OutputDto {
  @ApiProperty({
    example: 1,
    description: `
    1ページあたりの物品数
    `,
    type: Number,
  })
  @Expose({ name: 'count' })
  count: number;

  @Type(() => ItemResults)
  @Expose({ name: 'results' })
  results: ItemResults[];
}
