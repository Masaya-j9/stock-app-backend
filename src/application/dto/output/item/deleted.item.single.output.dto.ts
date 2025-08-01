import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
}
export class DeletedItemSingleOutputDto implements OutputDto {
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
    数量
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
    example: [
      {
        id: 1,
        name: 'テストカテゴリー',
        description: 'このカテゴリーはテスト用です。',
      },
      {
        id: 2,
        name: 'テストカテゴリー2',
        description: 'このカテゴリーはテスト用です。',
      },
    ],
    description: `
    カテゴリー
    `,
    type: [itemCategories],
  })
  @Expose({ name: 'item_categories' })
  itemCategories: itemCategories[];
}
