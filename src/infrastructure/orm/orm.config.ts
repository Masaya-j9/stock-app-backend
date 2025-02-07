import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();

console.log(configService.get<string>('DB_HOST'));
console.log(configService.get<number>('DB_PORT'));
console.log(configService.get<string>('DB_USERNAME'));
console.log(configService.get<string>('DB_PASSWORD'));
console.log(configService.get<string>('DB_NAME'));

export const ormConfig: DataSourceOptions = {
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: ['dist/infrastructure/orm/entities/**/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true, // 開発環境用、本番環境ではfalseに設定
  migrations: ['dist/infrastructure/migrations/**/*.js'],
  extra: {
    // Public Key Retrievalを許可
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
  },
  logging: true,
};

export const AppDataSource = new DataSource(ormConfig);
