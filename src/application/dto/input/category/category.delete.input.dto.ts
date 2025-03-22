import { InputDto } from '../input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CategoryDeleteInputDto implements InputDto {
  @ApiProperty({
    example: '1',
    description: 'カテゴリーID',
    type: String,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  categoryId: number;
}
