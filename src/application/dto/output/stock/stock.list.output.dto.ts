import { OutputDto } from '../../output/output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StockItem {
  @ApiProperty({
    example: 1,
    description: '物品ID',
    type: Number,
  })
  @Expose({ name: 'id' })
  id: number;

  @ApiProperty({
    example: 'テスト物品',
    description: '物品名',
    type: String,
  })
  @Expose({ name: 'name' })
  name: string;
}

export class StockResults {
  @ApiProperty({
    example: 1,
    description: '在庫ID',
    type: Number,
  })
  @Expose({ name: 'id' })
  id: number;

  @ApiProperty({
    example: 10,
    description: '在庫数量',
    type: Number,
  })
  @Expose({ name: 'quantity' })
  quantity: number;

  @ApiProperty({
    example: 'この在庫はテスト用です。',
    description: '在庫の説明',
    type: String,
  })
  @Expose({ name: 'description' })
  description: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: '作成日時',
    type: Date,
  })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: '更新日時',
    type: Date,
  })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Type(() => StockItem)
  @ApiProperty({
    example: {
      id: 1,
      name: 'テスト物品',
    },
    description: '関連する物品情報',
    type: StockItem,
    nullable: true,
  })
  @Expose({ name: 'item' })
  item: StockItem | null;
}

export class StockListOutputDto implements OutputDto {
  @ApiProperty({
    example: 1,
    description: '1ページあたりの在庫数',
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

  @Type(() => StockResults)
  @ApiProperty({
    example: [
      {
        id: 1,
        quantity: 10,
        description: 'この在庫はテスト用です。',
        createdAt: '2021-01-01T00:00:00.000Z',
        updatedAt: '2021-01-01T00:00:00.000Z',
        item: {
          id: 1,
          name: 'テスト物品',
        },
      },
      {
        id: 2,
        quantity: 20,
        description: 'この在庫はテスト用です。',
        createdAt: '2021-01-01T00:00:00.000Z',
        updatedAt: '2021-01-01T00:00:00.000Z',
        item: {
          id: 2,
          name: 'テスト物品2',
        },
      },
    ],
    description: '在庫一覧（物品情報含む）',
    type: [StockResults],
  })
  @Expose({ name: 'results' })
  results: StockResults[];
}
