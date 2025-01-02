import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './main.seeder';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();

console.log('DB_HOST:', configService.get<string>('DB_HOST'));
console.log('DB_PORT:', configService.get<string>('DB_PORT'));
console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
console.log('DB_PASSWORD:', configService.get<string>('DB_PASSWORD'));
console.log('DB_NAME:', configService.get<string>('DB_NAME'));

const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: ['src/infrastructure/orm/entities/**/*.ts'],
  factories: ['src/infrastructure/orm/seeds/factories/**/*.ts'],
  synchronize: true, // 開発時のみtrue
  seeds: [MainSeeder],
  extra: {
    // Public Key Retrievalを許可
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
  },
  namingStrategy: new SnakeNamingStrategy(),
};

const dataSource = new DataSource(options);

dataSource.initialize().then(async () => {
  await dataSource.synchronize(true);
  await runSeeders(dataSource);
  process.exit();
});
