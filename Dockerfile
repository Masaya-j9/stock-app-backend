# ビルドステージ
FROM node:lts-buster-slim AS builder

# 作業ディレクトリを設定
WORKDIR /api

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのその他のファイルをコピー
COPY . .

# アプリケーションをビルド (オプション: アプリがビルドステップを持つ場合、例: TypeScript)
RUN npm run build

# 本番環境ステージ
FROM node:lts-buster-slim as development

# 最終コンテナ内の作業ディレクトリを設定
WORKDIR /api

# ビルドステージから必要なファイルのみをコピー
COPY --from=builder /api/node_modules ./node_modules
COPY --from=builder /api .

# アプリが実行されるポートを公開
EXPOSE 4000

# アプリケーションを起動
CMD ["npm", "run", "start:dev"]