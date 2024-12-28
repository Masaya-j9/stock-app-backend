import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();

export const ormConfig: DataSourceOptions = {
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: ['src/infrastructure/orm/entities/**/*.ts'], // エンティティのパスを指定
  synchronize: false, // 開発環境用、本番環境ではfalseに設定
  migrations: ['src/infrastructure/migrations/*.ts'],
};

export const AppDataSource = new DataSource(ormConfig);
