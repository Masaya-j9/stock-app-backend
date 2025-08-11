import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';
import * as fs from 'fs';
import { SEED_DATA_PATTERNS } from './seed.data.config';

ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();
const logger = new Logger('SeedSpecific');

logger.log(`DB接続情報:
  - DB_HOST: ${configService.get<string>('DB_HOST')}
  - DB_PORT: ${configService.get<string>('DB_PORT')}
  - DB_USERNAME: ${configService.get<string>('DB_USERNAME')}
  - DB_PASSWORD: ${configService.get<string>('DB_PASSWORD')}
  - DB_NAME: ${configService.get<string>('DB_NAME')}`);

/**
 * 指定されたファクトリーのマスターデータを直接DBに挿入する
 * 使用例: npm run typeorm:seed:specific -- stock.history.statuses
 */
async function runSpecificSeeder() {
  const factoryName = process.argv[2];

  if (!factoryName) {
    logger.error('エラー: ファクトリー名を指定してください');
    logger.log(
      '使用例: npm run typeorm:seed:specific -- stock.history.statuses'
    );
    logger.log('使用例: npm run typeorm:seed:specific -- categories');
    process.exit(1);
  }

  try {
    // ファクトリーファイルのパスを構築
    const factoryFileName = `${factoryName}.factory.ts`;
    const factoryPath = path.join(__dirname, 'factories', factoryFileName);

    // ファイルの存在確認
    if (!fs.existsSync(factoryPath)) {
      logger.error(
        `エラー: ファクトリーファイルが見つかりません: ${factoryPath}`
      );

      const factoryFiles = fs
        .readdirSync(path.join(__dirname, 'factories'))
        .filter((file) => file.endsWith('.factory.ts'))
        .map((file) => file.replace('.factory.ts', ''));

      logger.log(
        `利用可能なファクトリー:\n${factoryFiles.map((file) => `  - ${file}`).join('\n')}`
      );
      process.exit(1);
    }

    // ファクトリーモジュールを読み込み
    const factoryModule = await import(factoryPath);

    // マスターデータ配列を検索
    const dataArray = findDataArray(factoryModule);
    if (!dataArray) {
      logger.error(
        `エラー: ${factoryName} にマスターデータ配列が見つかりません`
      );
      logger.log('利用可能なエクスポート:', Object.keys(factoryModule));
      process.exit(1);
    }

    // エンティティクラスを取得
    const EntityClass = await getEntityClass(factoryName);
    if (!EntityClass) {
      logger.error(
        `エラー: ${factoryName} のエンティティクラスが見つかりません`
      );
      process.exit(1);
    }

    // DB接続
    const dataSource = new DataSource({
      type: 'mysql',
      host: configService.get<string>('DB_HOST'),
      port: parseInt(configService.get<string>('DB_PORT'), 10),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      entities: ['src/infrastructure/orm/entities/**/*.ts'],
      synchronize: false,
      extra: {
        connectionLimit: 10,
        allowPublicKeyRetrieval: true,
      },
      namingStrategy: new SnakeNamingStrategy(),
    });

    await dataSource.initialize();
    logger.log(`実行中: ${factoryName} マスターデータ挿入`);

    const repository = dataSource.getRepository(EntityClass);

    // 既存データの確認
    const existingCount = await repository.count();
    if (existingCount > 0) {
      logger.log(`${factoryName} のデータが既に存在します。スキップします。`);
    } else {
      // マスターデータ配列からエンティティを作成
      const entities = dataArray.map((data: any) => {
        const entity = new EntityClass();
        // 共通プロパティを設定
        if (data.name) entity.name = data.name;
        if (data.description) entity.description = data.description;
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        entity.deletedAt = null;
        return entity;
      });

      await repository.save(entities);
      logger.log(`${entities.length} 件のデータを挿入しました。`);
    }

    logger.log(`完了: ${factoryName} マスターデータの挿入が完了しました！`);
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('マスターデータ挿入エラー:', error);
    process.exit(1);
  }
}

/**
 * ファクトリーモジュールからマスターデータ配列を検索
 */
function findDataArray(factoryModule: any): any[] | null {
  // 設定ファイルからパターンを取得
  const patterns = SEED_DATA_PATTERNS;

  for (const pattern of patterns) {
    if (factoryModule[pattern] && Array.isArray(factoryModule[pattern])) {
      logger.log(
        `Found data array: ${pattern} with ${factoryModule[pattern].length} items`
      );
      return factoryModule[pattern];
    }
  }

  return null;
}

/**
 * ファクトリー名からエンティティクラスを取得
 */
async function getEntityClass(factoryName: string): Promise<any> {
  try {
    // エンティティ名を推定 (stock.history.statuses -> StockHistoryStatuses)
    const entityName = factoryName
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // エンティティファイルパスを構築
    const entityPath = path.join(
      __dirname,
      '../entities',
      `${factoryName}.entity.ts`
    );

    if (!fs.existsSync(entityPath)) {
      logger.error(`エンティティファイルが見つかりません: ${entityPath}`);
      return null;
    }

    const entityModule = await import(entityPath);
    return entityModule[entityName] || null;
  } catch (error) {
    logger.error('エンティティクラス取得エラー:', error);
    return null;
  }
}

runSpecificSeeder();
