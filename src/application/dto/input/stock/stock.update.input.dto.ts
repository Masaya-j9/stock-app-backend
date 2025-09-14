import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';
import {
  EventSource,
  EVENT_SOURCES,
} from '../../../services/stock/constants/event.sources';
import { ItemUpdatedEvent } from 'src/application/services/item/events/item.updated.event.publisher.interface';

export class StockUpdateInputDto implements InputDto {
  @ApiProperty({
    example: 1,
    description: 'アイテムID',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'テストアイテム',
    description: 'アイテム名',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Expose({ name: 'name' })
  name: string;

  @ApiProperty({
    example: 10,
    description: '数量',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 'テストアイテムの説明',
    description: 'アイテムの説明',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Expose({ name: 'description' })
  description?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '作成日時',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  @Type(() => Date)
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '更新日時',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  @Type(() => Date)
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    example: [1, 2],
    description: 'カテゴリーIDの配列',
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @Expose({ name: 'category_ids' })
  categoryIds: number[];

  @ApiProperty({
    example: 'item.created',
    description: 'イベントソース',
    enum: Object.values(EVENT_SOURCES),
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(Object.values(EVENT_SOURCES))
  @Expose({ name: 'event_source' })
  eventSource: EventSource;

  toItemUpdatedEvent(): ItemUpdatedEvent {
    return {
      id: this.id,
      name: this.name,
      quantity: this.quantity,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      categoryIds: this.categoryIds,
    };
  }
}
