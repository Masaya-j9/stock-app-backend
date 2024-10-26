import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Observable, from } from 'rxjs';

@ApiTags('stock-app')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Healthチェックを実施' })
  check(): Observable<HealthCheckResult> {
    return from(this.health.check([() => this.db.pingCheck('database')]));
  }
}
