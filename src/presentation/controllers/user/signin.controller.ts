import { Controller, Post, Inject, Body } from '@nestjs/common';
import { SignInServiceInterface } from 'src/application/services/user/signin.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SignInInputDto } from '../../../application/dto/input/user/signin.input.dto';
import { SignInOutputDto } from '../../../application/dto/output/user/signin.output.dto';

@ApiTags('stock-app')
@Controller()
export class SignInController {
  constructor(
    @Inject('SignInServiceInterface')
    private readonly SigninService: SignInServiceInterface
  ) {}

  /**
   * @param body - ログイン情報
   * @param request - リクエスト情報
   * @returns {Observable<SignInOutputDto>} - ログイン成功したかの情報を含むObservable
   */

  @ApiOperation({
    summary: 'ログインをするときのエンドポイント',
    description: 'idとパスワードを入力して、ログインが成功かどうかを返すAPI',
  })
  @ApiResponse({
    status: 201,
    description: 'OK',
    type: SignInOutputDto,
  })
  @Post('/login')
  @ApiBody({
    type: SignInInputDto,
  })
  signin(
    @Body() body: any
    // @Req() request: Request,
  ): Observable<SignInOutputDto> {
    const loginServiceInput = plainToInstance(SignInInputDto, body);
    return this.SigninService.service(loginServiceInput);
  }
}
