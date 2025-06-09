# ベースイメージ
FROM node:20-alpine

# Gaugeのインストール
RUN apk add --no-cache curl bash \
    && curl -SsL https://downloads.gauge.org/stable | sh \
    && gauge install js

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール（devDependenciesも含む）
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# 本番用依存関係のみ再インストール
RUN npm ci --only=production && npm cache clean --force

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs \
    && adduser -S gauge -u 1001

# ファイルの所有者を変更
RUN chown -R gauge:nodejs /app
USER gauge

# ポートの公開（必要に応じて）
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD gauge version || exit 1

# エントリーポイント
CMD ["node", "build/index.js"]
