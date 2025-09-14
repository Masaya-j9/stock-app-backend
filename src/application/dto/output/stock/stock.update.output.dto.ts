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

export class StockStatus {
  @ApiProperty({
    example: 1,
    description: '在庫ステータスID',
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: '利用可能',
    description: '在庫ステータス名',
    type: String,
  })
  name: string;

  //description
  @ApiProperty({
    example: 'この在庫は利用可能です。',
    description: '在庫ステータスの説明',
    type: String,
  })
  description: string;
}

export class StockUpdateOutputDto implements OutputDto {
  @ApiProperty()
  @Expose()
  id: number | string;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
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

  @Type(() => StockStatus)
  @ApiProperty({
    example: {
      id: 1,
      name: '利用可能',
      description: 'この在庫は利用可能です。',
    },
    description: '関連する在庫ステータス情報',
    type: StockStatus,
  })
  @Expose({ name: 'status' })
  status: StockStatus;
}
