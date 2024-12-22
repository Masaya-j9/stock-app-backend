import { ApiPropertyOptional } from '@nestjs/swagger';
import { InputDto } from '../../input/input.dto';
import { IsOptional, IsString, Min, Max } from 'class-validator';

const USER_NAME_MIN: number = 8;
const USER_NAME_MAX: number = 30;
const PASSWORD_MIN_COUNT: number = 8;
const PASSWORD_MAX_COUNT: number = 20;

export class SignUpOutputDto implements InputDto {
  @ApiPropertyOptional({
    name: 'name',
    description: 'ユーザーネーム',
    type: String,
    example: 'hoge',
  })
  @IsOptional()
  @IsString()
  @Min(USER_NAME_MIN)
  @Max(USER_NAME_MAX)
  name: string;

  @ApiPropertyOptional({
    name: 'password',
    description: '新規作成用に入力するパスワード',
    type: String,
    example: 'hogehogehoge',
  })
  @IsOptional()
  @IsString()
  @Min(PASSWORD_MIN_COUNT)
  @Max(PASSWORD_MAX_COUNT)
  password: string;
}
