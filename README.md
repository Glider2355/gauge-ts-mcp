# Gauge MCP Server

シンプルなGauge TypeScript MCP（Model Context Protocol）サーバーです。

## 機能

3つの主要なツールを提供：

1. **create_from_template** - テンプレートからGaugeプロジェクトファイルを作成
2. **get_implemented_steps** - 実装済みのステップを取得
3. **run_gauge** - Gaugeコマンドを実行

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### 方法1: npx実行（最もシンプル）

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. ビルド
npm run build

# 3. 別プロジェクトからnpxで実行
cd ../my-other-project
npx /path/to/gauge-ts-mcp/build/index.js
```

### 方法2: グローバルインストール

別プロジェクトからも使用したい場合：

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. グローバルインストール
npm run global:install

# 3. どこからでも使用可能
cd ../my-other-project
gauge-mcp-server  # どこからでも実行可能
```

### 方法2: ローカルインストール

このリポジトリ内でのみ使用する場合：

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. ローカルセットアップ
npm run setup

# 3. 動作確認
npm run inspector
```

## 📋 使用方法

### 基本的な使用方法

```bash
# MCPサーバー起動
npm start

# MCP Inspector で動作確認（別ターミナル）
npm run inspector
```

### 開発

```bash
# TypeScript ウォッチモード
npm run dev

# テスト実行
npm test

# テスト実行（一回のみ）
npm run test:run

# カバレッジ付きテスト
npm run test:coverage
```

### プロセス管理

```bash
# 動作中のプロセス確認
npm run ps

# 全停止（MCPサーバー + Inspector）
npm run stop

# Inspector のみ停止
npm run stop:inspector

# MCPサーバーのみ停止
npm run stop:server
```

## 🛠️ Cline（VS Code拡張）での設定

Cline VS Code拡張機能でこのMCPサーバーを使用する方法：

### 方法1: npx実行（推奨）

最もシンプルで、インストール不要：

```json
{
  "cline.mcpServers": {
    "gauge-mcp-server": {
      "command": "npx",
      "args": ["/absolute/path/to/gauge-ts-mcp/build/index.js"]
    }
  }
}
```

### 方法2: グローバルインストール後の設定

グローバルインストール後は、どのプロジェクトからでも使用可能：

```json
{
  "cline.mcpServers": {
    "gauge-mcp-server": {
      "command": "gauge-mcp-server"
    }
  }
}
```

### 方法2: 絶対パス指定

グローバルインストールしない場合：

```json
{
  "cline.mcpServers": {
    "gauge-mcp-server": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/gauge-ts-mcp"
    }
  }
}
```

### 方法3: npm script を使用

```json
{
  "cline.mcpServers": {
    "gauge-mcp-server": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/absolute/path/to/gauge-ts-mcp"
    }
  }
}
```

### 使用方法

1. VS CodeでCline拡張機能を開く
2. チャットで以下のようなリクエストを送信：
   - "basic-webテンプレートで新しいプロジェクトを作成して"
   - "実装済みのステップを一覧表示して"
   - "Gaugeテストを実行して"

### 設定の確認

```bash
# npx実行の場合
npx /path/to/gauge-ts-mcp/build/index.js

# グローバルインストールの場合
gauge-mcp-server

# ローカルの場合
npm start

# プロセス確認
npm run ps

# 停止
npm run stop

# Clineから接続テスト
# VS CodeのClineチャットで "@gauge-mcp-server" と入力して候補が表示されるか確認
```

## 🗂️ 別リポジトリでの使用例

### 典型的なワークフロー

```bash
# 1. 別のGaugeプロジェクトに移動
cd ~/projects/my-web-app

# 2. npxで直接MCP Inspector起動（テスト用）
npx ~/projects/gauge-ts-mcp/build/index.js

# 3. VS CodeでClineを使用
# プロジェクトパス: /Users/yourname/projects/my-web-app
{
  "name": "get_implemented_steps",
  "arguments": {
    "projectPath": "/Users/yourname/projects/my-web-app"
  }
}

# 4. Clineでの自然言語での依頼例
"このプロジェクトの実装済みステップを教えて"
"basic-webテンプレートで新しいテストファイルを作成して"
"Gaugeテストを実行して"
```

### プロジェクト構造例

```
~/projects/
├── gauge-ts-mcp/          # MCPサーバー（一度だけ）
│   ├── src/
│   └── build/
├── my-web-app/            # 実際の開発プロジェクト1
│   ├── specs/
│   ├── steps/
│   └── manifest.json
└── another-gauge-project/ # 実際の開発プロジェクト2
    ├── specs/
    ├── steps/
    └── manifest.json
```

## 📖 使用例

### 1. テンプレートからファイル作成

```json
{
  "name": "create_from_template",
  "arguments": {
    "projectPath": "/path/to/my-project",
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
    "projectPath": "/path/to/my-project"
  }
}
```

### 3. Gauge実行

```json
{
  "name": "run_gauge",
  "arguments": {
    "projectPath": "/path/to/my-project",
    "command": "run",
    "specPath": "specs/example.spec",
    "environment": "default"
  }
}
```

## 📚 テンプレート

サポートされているテンプレート：

- **basic-web** - 基本的なWebテスト用
- **web-ecommerce** - ECサイトテスト用
- **api-testing** - API テスト用

## 🔧 トラブルシューティング

### ポート競合エラー

```bash
# 動作中のプロセス確認
npm run ps

# ポート使用状況確認
lsof -i :6274 -i :6277

# 全プロセス強制停止
npm run stop
```

### プロセスが停止しない場合

```bash
# 手動でプロセス確認
ps aux | grep gauge-mcp-server

# PIDを指定して強制終了
kill -9 <PID>

# または特定ポートのプロセス強制終了
lsof -ti:6274 | xargs kill -9
```

## 🔧 開発者向け

### プロジェクト構造

```
src/
├── tools/           # ツール別ファイル
├── templates/       # Gaugeテンプレート
├── utils/          # ユーティリティ
└── index.ts        # メインファイル
test/               # テストファイル
```

### カスタマイズ

- `src/templates/`: 新しいテンプレートを追加
- `src/tools/`: 新しいツールを追加
- `test/`: テストファイルを追加

## 📝 ライセンス

MIT
