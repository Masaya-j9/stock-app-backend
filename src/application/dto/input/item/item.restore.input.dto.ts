import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ItemRestoreInputDto implements InputDto {
  @ApiProperty({
    example: '1',
    description: '物品ID',
    type: String,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  id: number;
}
