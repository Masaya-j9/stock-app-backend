import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [], // ここにエンティティを追加
  synchronize: true, // 開発環境用、本番環境ではfalseに設定
  migrations: ['dist/infrastructure/migrations/*.js'],
};
