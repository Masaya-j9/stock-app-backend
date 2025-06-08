import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ItemRestoreOutputDto implements OutputDto {
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

  //作成日
  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    作成日時
    `,
    type: Date,
  })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    更新日時
    `,
    type: Date,
  })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: `
    削除日時
    `,
    type: Date,
  })
  @Expose({ name: 'deleted_at' })
  deletedAt: Date | null;
}
