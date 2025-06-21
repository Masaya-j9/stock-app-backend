import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class DeletedItemSingleInputDto implements InputDto {
  @ApiProperty({
    example: '1',
    description: '物品ID',
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  id: number;
}
