import { Controller, Get, Inject } from '@nestjs/common';
import { ProfileServiceInterface } from '../../../application/services/profile/profile.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileInputDto } from '../../../application/dto/input/profile/profile.input.dto';
import { ProfileOutputDto } from '../../../application/dto/output/profile/profile.output.dto';

@ApiTags('stock-app')
@Controller()
export class ProfileController {
  constructor(
    @Inject('ProfileServiceInterface')
    private readonly ProfileService: ProfileServiceInterface
  ) {}
  /**
   * @param body - ログイン情報
   * @param request - リクエスト情報
   * @returns {Observable<ProfileInputDto>} - プロフィール情報を返すObservable
   */

  @ApiOperation({
    summary: 'ユーザー自身のプロフィール情報を取得するエンドポイント',
    description:
      'ユーザーがログインしているときに、ログインユーザーのプロフィール情報をレスポンスとして返すAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: ProfileOutputDto,
  })
  @Get('/profile')
  @ApiBody({
    type: ProfileInputDto,
  })
  findProfileInfo(): Observable<ProfileInputDto> {
    return this.ProfileService.service(ProfileInputDto);
  }
}
