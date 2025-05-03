<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## モデリングした内容について
### APIドキュメントについて
起動後、以下のエンドポイントをブラウザでアクセスする
```
http://localhost:4000/swagger
```
### ユビキタス言語について
- [ユビキタス言語集のURL](https://docs.google.com/spreadsheets/d/1iG-OT2WOR4m4MekhEshM-utDvKH2KD6XZsPkvSSkf1k/edit?gid=0#gid=0)を参照

### ユースケースについて
![ユースケース図について](assets/usecase-diagram.png)
### ドメインモデルについて
![ドメインモデル図について](assets/domain-models/20250216145938-domain-model.png)
### データベース設計について
![ER図について](assets/relations/20250103163134-relations.png)


## READMEの更新
### ER図
1. 下記のコマンドでER図の新規画像を作成する
2. README.mdのパスを張り替える

```
chmod +x blue-print/shells/diagram.sh

./blue-print/shells/diagram.sh
```

### ドメインモデル図
1. 下記のコマンドでドメインモデル図の新規画像を作成する
2. README.mdのパスを張り替える

```
chmod +x blue-print/shells/doomain-model.sh

./blue-print/shells/doomain-model.sh
```


## dockerの起動方法

### Buildコマンド
```
 docker compose build
```

### 起動コマンド(logも見たいときは`-d`を外す)
```
 docker compose up -d
```

### テストコマンド
```
 docker compose --rm api npm run test (ファイル名)
```

### ライブラリのinstall
```
docker run --rm api npm install (ライブラリ名)
```

## TypeORMを用いたマイグレーションについて

※コンテナ上で実施したい場合、npmコマンドの前に随時`docker compose run`コマンドをつけること

※データが消失するのでバックアップをとったり、seedでいつでもデータ作成できるようにしておくこと！

1. 該当するエンティティファイルを編集して、マイグレーションファイルを作成する
```
npm run typeorm:migration:generate -- ./src/infrastructure/migrations/${返変更する内容に関する内容でファイル名を作成する}
```

2. 一度、DB用のコンテナを停止する
```
docker compose down
```

3. 既存のvolumesにデータが残っている場合は削除する
```
docker volume ls
```

```
docker volume rm ${volume名}
```

4. コンテナを再起動
```
docker compose build
```
#### apiコンテナを起動する
```
docker compose up api -d
```

#### DBコンテナを起動する
```
docker compose up db -d
```
#### RabbitMQコンテナを起動する
```
docker compose up mq -d
```
5. ビルドして、初期化する
```
npm run build
```

6. マイグレーションコマンドでテーブルを構築する
```
npm run typeorm:migration:run
```

## Seedデータの作成
```
npm run typeorm:seed:run
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
