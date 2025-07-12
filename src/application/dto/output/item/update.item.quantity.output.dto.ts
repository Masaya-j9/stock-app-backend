import 'reflect-metadata';
import { OutputDto } from '../output.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateItemQuantityOutputDto implements OutputDto {
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
    example: 1,
    description: `
    物品の個数
    `,
    type: Number,
  })
  @Expose({ name: 'quantity' })
  quantity: number;

  @ApiProperty({
    example: '2023-08-01T00:00:00.000Z',
    description: `
    更新日時
    `,
    type: Date,
  })
  @Expose({ name: 'updatedAt' })
  updatedAt: Date;
}
