import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './infrastructure/orm/orm.config';
import { HealthModule } from './presentation/modules/health.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
