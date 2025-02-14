import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './infrastructure/orm/orm.config';
import { HealthModule } from './presentation/modules/health.module';
import { UserModule } from './presentation/modules/user.module';
import { ItemsModule } from './presentation/modules/items.module';
import { LoggerInterceptor } from './common/utils/logger.inspector';
import { DatabaseModule } from './presentation/modules/database.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    HealthModule,
    UserModule,
    ItemsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
  ],
})
export class AppModule {}
