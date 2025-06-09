# Gauge MCP Server

シンプルなGauge TypeScript MCP（Model Context Protocol）サーバーです。

## 機能

3つの主要なツールを提供：

1. **create_from_template** - テンプレートからGaugeプロジェクトファイルを作成
2. **get_implemented_steps** - 実装済みのステップを取得
3. **run_gauge** - Gaugeコマンドを実行

## 🚀 ワンコマンド環境構築

### 基本的な使用方法

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. ワンコマンドでビルド→起動
docker-compose up --build -d

# または
make setup
```

### 使用可能なコマンド

#### 🔥 **推奨: Makeを使った簡単操作**

```bash
# ヘルプを表示
make help

# ワンコマンドセットアップ
make setup

# 基本操作
make build      # ビルド
make up         # 起動
make down       # 停止
make restart    # 再起動
make logs       # ログ表示

# 開発・テスト
make inspector  # MCP Inspector起動
make test       # テスト環境起動
make dev        # 開発環境起動

# クリーンアップ
make clean      # 全削除
```

#### 🐳 **直接Docker Composeを使用**

```bash
# 基本操作
docker-compose build                    # ビルド
docker-compose up -d                    # 起動
docker-compose down                     # 停止
docker-compose logs -f gauge-mcp-server # ログ表示

# MCP Inspector起動（開発・テスト用）
docker-compose --profile inspector up -d

# テスト環境起動
docker-compose --profile test up -d

# 開発環境起動（Inspector + Test）
docker-compose --profile dev up -d

# 全削除
docker-compose down --rmi all --volumes --remove-orphans
```

## 環境モード

| モード | コマンド | 説明 |
|--------|----------|------|
| **本番** | `docker-compose up -d` | 基本のMCPサーバーのみ |
| **Inspector** | `docker-compose --profile inspector up -d` | MCP Inspector付き（ポート6274） |
| **テスト** | `docker-compose --profile test up -d` | テスト環境付き |
| **開発** | `docker-compose --profile dev up -d` | Inspector + テスト環境 |

## クイックスタート例

```bash
# 1. 環境構築（初回のみ）
git clone <repository-url>
cd gauge-ts-mcp
docker-compose up --build -d

# 2. MCP Inspector で動作確認
docker-compose --profile inspector up -d
# ブラウザで http://localhost:6274 を開く

# 3. テスト環境で Gauge コマンド実行
docker-compose --profile test up -d
docker-compose exec gauge-test-env gauge version

# 4. 停止
docker-compose down
```

## 使用例

### 1. テンプレートからファイル作成

```json
{
  "name": "create_from_template",
  "arguments": {
    "projectPath": "/app/projects/my-project",
    "templateName": "basic-web",
    "projectName": "MyProject",
    "includeSetup": true
  }
}
```

### 2. 実装済みステップ取得

```json
{
  "name": "get_implemented_steps",
  "arguments": {
    "projectPath": "/app/projects/my-project",
    "environment": "default"
  }
}
```

### 3. Gauge実行

```json
{
  "name": "run_gauge",
  "arguments": {
    "projectPath": "/app/projects/my-project",
    "command": "run",
    "specPath": "specs/example.spec",
    "environment": "default"
  }
}
```

## テンプレート

サポートされているテンプレート：

- **basic-web** - 基本的なWebテスト用
- **web-ecommerce** - ECサイトテスト用
- **api-testing** - API テスト用

## トラブルシューティング

### ポート競合エラー
```bash
# 使用中のポートを確認
docker-compose down
lsof -i :6274 -i :6277

# 強制停止
docker-compose down --remove-orphans
```

### イメージ再ビルド
```bash
# キャッシュを使わず完全に再ビルド
docker-compose build --no-cache
```

## 開発者向け

### ローカル開発（Docker使わない場合）

```bash
# 依存関係のインストール
npm install

# TypeScriptビルド
npm run build

# サーバー起動
npm start

# MCP Inspector で動作確認
npm run inspector
```

### カスタマイズ

- `projects/` フォルダ: Gaugeプロジェクトを配置
- `examples/` フォルダ: サンプルファイルを配置
- 環境変数: `docker-compose.yml` で設定

## 前提条件

- Docker
- Docker Compose
- (オプション) Make

## ライセンス

MIT
