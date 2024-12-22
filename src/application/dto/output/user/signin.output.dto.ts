// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IsOptional, Contains, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InputDto } from '../../input/input.dto';

const PASSWORD_MIN_COUNT: number = 8;
const PASSWORD_MAX_COUNT: number = 20;

export class SignInOutputDto implements InputDto {
  @ApiPropertyOptional({
    name: 'mail',
    description: 'メールアドレスで@を含む必要がある',
    type: String,
    example: 'hoge@gmail.com',
  })
  @IsOptional()
  @IsString()
  @Contains('@')
  mail: string;

  @ApiPropertyOptional({
    name: 'password',
    description: 'パスワード',
    type: String,
    example: '*******',
  })
  @IsOptional()
  @IsString()
  @Min(PASSWORD_MIN_COUNT)
  @Max(PASSWORD_MAX_COUNT)
  password: string;
}
