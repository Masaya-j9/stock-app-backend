import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class itemCategories {
  @ApiProperty({
    example: 1,
    description: 'カテゴリーID',
    type: Number,
  })
  @Expose({ name: 'id' })
  id: number;

  @ApiProperty({
    example: 'テストカテゴリー',
    description: 'カテゴリー名',
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

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    削除日時
    `,
    type: String,
  })
  @Expose({ name: 'deleted_at' })
  deletedAt: Date;
}

export class DeletedItemResults {
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

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
      削除日時
      `,
    type: String,
  })
  @Expose({ name: 'deleted_at' })
  deletedAt: Date;

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

export class DeletedItemListOutputDto implements OutputDto {
  //count
  @ApiProperty({
    example: 2,
    description: `
    論理削除された物品の数
    `,
    type: Number,
  })
  @Expose({ name: 'count' })
  count: number;

  //totalPages
  @ApiProperty({
    example: 1,
    description: `
    総ページ数
    `,
    type: Number,
  })
  @Expose({ name: 'total_pages' })
  totalPages: number;

  @ApiProperty({
    example: 0,
    description: `
    並べ替え順
    0: 昇順(省略された場合はデフォルトとする)
    1: 降順
    `,
    type: Number,
  })
  @Expose({ name: 'sort_order' })
  sortOrder?: number;

  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'テスト物品',
        quantity: 1,
        description: 'この物品はテスト用です。',
        Category: {
          id: 1,
          name: 'テストカテゴリー',
          description: 'このカテゴリーはテスト用です。',
          created_at: '2021-01-01T00:00:00.000Z',
          updated_at: '2021-01-01T00:00:00.000Z',
          deleted_at: '2021-01-01T00:00:00.000Z',
        },
      },
      {
        id: 2,
        name: 'テスト物品2',
        quantity: 2,
        description: 'この物品はテスト用2です。',
        Category: {
          id: 2,
          name: 'テストカテゴリー2',
          description: 'このカテゴリーはテスト用2です。',
          created_at: '2021-01-02T00:00:00.000Z',
          updated_at: '2021-01-02T00:00:00.000Z',
          deleted_at: '2021-01-02T00:00:00.000Z',
        },
      },
    ],
    type: [DeletedItemResults],
    description: '論理削除された物品の一覧',
  })
  @Type(() => DeletedItemResults)
  results: DeletedItemResults[];
}
