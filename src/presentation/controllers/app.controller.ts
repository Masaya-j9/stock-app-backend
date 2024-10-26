import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../app.service';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('stock-app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '起動時のエンドポイント' })
  @ApiResponse({ status: 200, description: 'デフォルトなので特になし' })
  getHello(): Observable<string> {
    return this.appService.getObservableHelloWorld();
  }
}
