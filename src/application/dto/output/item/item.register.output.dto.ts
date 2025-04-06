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

export class ItemRegisterOutputDto implements OutputDto {
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
    example: '2023-10-01T00:00:00.000Z',
    description: `
    作成日
    `,
    type: Date,
  })
  @Expose({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-10-01T00:00:00.000Z',
    description: `
    更新日
    `,
    type: Date,
  })
  @Expose({ name: 'createdAt' })
  updatedAt: Date;

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
    カテゴリーID
    `,
    type: Number,
  })
  @Expose({ name: 'itemCategories' })
  itemsCategories: itemCategories[];
}
