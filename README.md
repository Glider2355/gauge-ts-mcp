# Clineでの使用方法

このドキュメントでは、Gauge MCP ServerをClineから使用する方法を詳しく説明します。

## 🚀 クイックスタート（npx使用）

### 前提条件

- Node.js 18以上
- VS Code + Cline拡張
- Gauge CLI（オプション、Gaugeコマンド実行時のみ必要）

### ステップ1: プロジェクトのクローンとビルド

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd gauge-ts-mcp

# 2. 依存関係インストールとビルド
npm run setup
```

### ステップ2: Cline MCP設定

#### 方法A: VS Code設定UI使用（推奨）

1. VS CodeでCline拡張を開く
2. 設定アイコン（⚙️）をクリック
3. "MCP Servers"セクションで"Add Server"
4. 以下を入力：
   - **Server Name**: `gauge-mcp`
   - **Command**: `npx`
   - **Arguments**: `["<FULL_PATH>/gauge-ts-mcp/build/index.js"]`

**例:**
```
Server Name: gauge-mcp
Command: npx
Arguments: ["/Users/your-username/Dev/gauge-ts-mcp/build/index.js"]
```

#### 方法B: 設定ファイル手動編集

Clineの設定ファイルを直接編集：

**macOS/Linux:**
```bash
~/.config/cline/settings.json
```

**Windows:**
```bash
%APPDATA%\Cline\settings.json
```

設定内容：
```json
{
  "mcpServers": {
    "gauge-mcp": {
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


