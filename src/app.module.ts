import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './infrastructure/orm/orm.config';
import { HealthModule } from './presentation/modules/health.module';
import { LoggerInterceptor } from './common/utils/logger.inspector';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class AppModule {}
