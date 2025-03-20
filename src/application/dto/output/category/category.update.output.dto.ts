import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryUpdateOutputDto implements OutputDto {
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
    更新日時
    `,
    type: Date,
  })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;
}
