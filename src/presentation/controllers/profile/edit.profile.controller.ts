import { Controller, Patch, Inject, Body } from '@nestjs/common';
import { EditProfileServiceInterface } from 'src/application/services/profile/edit.profile.interface';
import { Observable } from 'rxjs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { EditProfileInputDto } from 'src/application/dto/input/profile/edit.profile.input.dto';
import { EditProfileOutputDto } from 'src/application/dto/output/profile/edit.profile.output.dto';
// import { request } from 'http';

@ApiTags('stock-app')
@Controller()
export class EditProfileController {
  constructor(
    @Inject('EditProfileServiceInterface')
    private readonly EditProfileService: EditProfileServiceInterface
  ) {}

  /**
   * @param body - プロフィール情報
   * @param request - リクエスト情報
   * @return {Observable<EditProfileOutputDto>} -
   */

  @ApiOperation({
    summary:
      'ログイン中のユーザーが自身のプロフィール情報を編集するエンドポイント',
    description: '更新された、プロフィール情報を返すAPI',
  })
  @ApiResponse({
    status: 204,
    description: 'updated',
    type: EditProfileOutputDto,
  })
  @Patch('/profile')
  @ApiBody({
    type: EditProfileInputDto,
  })
  updateProfile(
    @Body() body: any
    // @Req request: Request,
  ): Observable<EditProfileInputDto> {
    const updatedProfileService = plainToInstance(EditProfileInputDto, body);
    return this.EditProfileService.service(updatedProfileService);
  }
}
