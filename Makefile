.PHONY: help build up down restart logs clean inspector test

# デフォルトターゲット
help:
	@echo "🚀 Gauge MCP Server - Docker Compose コマンド"
	@echo ""
	@echo "基本コマンド:"
	@echo "  make build     - Dockerイメージをビルド"
	@echo "  make up        - サーバーを起動"
	@echo "  make down      - サーバーを停止"
	@echo "  make restart   - サーバーを再起動"
	@echo "  make logs      - ログを表示"
	@echo ""
	@echo "開発・テスト:"
	@echo "  make inspector - MCP Inspector付きで起動"
	@echo "  make test      - テスト環境を起動"
	@echo "  make dev       - 開発環境を起動（Inspector + Test）"
	@echo ""
	@echo "メンテナンス:"
	@echo "  make clean     - 全てのコンテナとイメージを削除"
	@echo ""
	@echo "ワンコマンド構築:"
	@echo "  make setup     - ビルド→起動を一括実行"
	@echo ""

# 基本操作
build:
	@echo "🔨 Dockerイメージをビルド中..."
	docker-compose build

up:
	@echo "🚀 Gauge MCP Serverを起動中..."
	docker-compose up -d gauge-mcp-server

down:
	@echo "🛑 サーバーを停止中..."
	docker-compose down

restart: down up
	@echo "🔄 サーバーを再起動しました"

logs:
	@echo "📋 ログを表示中... (Ctrl+C で終了)"
	docker-compose logs -f gauge-mcp-server

# 開発・テスト
inspector:
	@echo "🔍 MCP Inspector付きで起動中..."
	docker-compose --profile inspector up -d
	@echo "✅ 起動完了"
	@echo "🌐 Inspector URL: http://localhost:6274"

test:
	@echo "🧪 テスト環境を起動中..."
	docker-compose --profile test up -d
	@echo "✅ テスト環境が起動しました"
	@echo "💡 テストコマンド例:"
	@echo "   docker-compose exec gauge-test-env gauge version"

dev:
	@echo "🛠️ 開発環境を起動中..."
	docker-compose --profile dev up -d
	@echo "✅ 開発環境が起動しました"
	@echo "🌐 Inspector URL: http://localhost:6274"
	@echo "🧪 テスト環境も利用可能です"

# メンテナンス
clean:
	@echo "🧹 全てのコンテナとイメージを削除中..."
	docker-compose down --rmi all --volumes --remove-orphans
	@echo "✅ クリーンアップ完了"

# ワンコマンド
setup: build up
	@echo "🎉 Gauge MCP Server のセットアップが完了しました！"
	@echo "📋 ログ確認: make logs"
	@echo "🔍 Inspector起動: make inspector"

# 直接docker-composeコマンド用のショートカット
dc-build:
	docker-compose build

dc-up:
	docker-compose up -d

dc-down:
	docker-compose down

dc-logs:
	docker-compose logs -f
