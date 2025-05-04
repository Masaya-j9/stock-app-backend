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

  @ApiProperty({
    example: 'このカテゴリーはテスト用です。',
    description: `
    カテゴリーの詳細
    `,
    type: String,
  })
  @Expose({ name: 'description' })
  description: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    作成日時
    `,
    type: String,
  })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    更新日時
    `,
    type: String,
  })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;
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

  @ApiProperty({
    example: 6,
    description: '総ページ数',
    type: Number,
  })
  @Expose({ name: 'total_pages' })
  totalPages: number;

  @Type(() => ItemResults)
  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'テスト物品',
        quantity: 1,
        description: 'この物品はテスト用です。',
        itemsCategories: [
          {
            id: 1,
            name: 'テストカテゴリー',
            itemId: 1,
            description: 'このカテゴリーはテスト用です。',
            createdAt: '2021-01-01T00:00:00.000Z',
            updatedAt: '2021-01-01T00:00:00.000Z',
          },
        ],
      },
      {
        id: 2,
        name: 'テスト物品2',
        quantity: 2,
        description: 'この物品はテスト用です。',
        itemsCategories: [
          {
            id: 2,
            name: 'テストカテゴリー2',
            itemId: 2,
            description: 'このカテゴリーはテスト用です。',
            createdAt: '2021-01-01T00:00:00.000Z',
            updatedAt: '2021-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
    description: `
    物品一覧
    `,
    type: [ItemResults],
  })
  @Expose({ name: 'results' })
  results: ItemResults[];
}
