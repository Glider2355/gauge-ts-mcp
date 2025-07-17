# Clineでの使用方法

このドキュメントでは、Gauge MCP ServerをClineから使用する方法を詳しく説明します。

## 🚀 クイックスタート（npx使用）

### 前提条件

- Node.js 18以上
- VS Code + Cline拡張

### ステップ1: プロジェクトのクローンとビルド

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. 依存関係インストールとビルド
npm run setup
```

### ステップ2: Cline MCP設定
MCP Servers > Installed > Configure MCP Servers で下記を設定する

```json
{
  "mcpServers": {
    "gauge-ts-mcp": {
      "command": "npx",
      "args": ["/Users/your-username/Dev/gauge-ts-mcp/build/index.js"]
    }
  }
}
```

### ステップ3: 使用開始

1. VS Codeを再起動
2. Cline拡張を開く
3. 新しいチャットを開始

## 実装済みtools
- `get_implemented_steps`: 実装済みのステップを取得


