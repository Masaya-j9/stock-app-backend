import { Inject, Post, Body, Controller } from '@nestjs/common';
import { SignUpServiceInterface } from 'src/application/services/user/signup.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SignUpInputDto } from 'src/application/dto/input/user/signup.input.dto';
import { SignUpOutputDto } from 'src/application/dto/output/user/signup.output.dto';

@ApiTags('stock-app')
@Controller()
export class SignUpController {
  constructor(
    @Inject('SignUpServiceInterface')
    private readonly signupService: SignUpServiceInterface
  ) {}

  /**
   * @param boby - 新規登録情報
   * @param request - リクエスト情報
   * @returns {Observable<SignUpOutputDto>}
   */

  @ApiOperation({
    summary: '新規登録するときのエンドポイント',
    description:
      'ユーザー自身のプロフィールを入力して、ユーザー情報を新規登録するかどうかを返すAPI',
  })
  @ApiResponse({
    status: 201,
    description: 'OK',
    type: SignUpOutputDto,
  })
  @Post('/signup')
  @ApiBody({
    type: SignUpInputDto,
  })
  signup(
    @Body() body: any
    // @Req() request: Request
  ): Observable<SignUpOutputDto> {
    const registerServiceInput = plainToInstance(SignUpInputDto, body);
    return this.signupService.service(registerServiceInput);
  }
}
