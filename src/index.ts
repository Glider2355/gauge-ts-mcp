#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  GetImplementedStepsTool,
  GetImplementedStepsArgs,
} from "./tools/get-implemented-steps.js";
import {
  CreateApiTemplateTool,
  CreateApiTemplateArgs,
} from "./tools/create-api-template.js";

class GaugeMCPServer {
  private server: Server;
  private getImplementedStepsTool: GetImplementedStepsTool;
  private createApiTemplateTool: CreateApiTemplateTool;

  constructor() {
    this.server = new Server(
      {
        name: "gauge-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // ツールのインスタンス化
    this.getImplementedStepsTool = new GetImplementedStepsTool();
    this.createApiTemplateTool = new CreateApiTemplateTool();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // ツール一覧の設定
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_api_template",
            description: "GaugeのAPIテスト用のテンプレートフォルダを作成します。outputPath/testNameにテンプレートを作成します。outputPathは指示がなければAPIのパスと一致させることを推奨します。",
            inputSchema: {
              type: "object",
              properties: {
                outputPath: {
                  type: "string",
                  description: "出力先のパス",
                },
                testName: {
                  type: "string",
                  description: "テスト観点(日本語)",
                },
              },
              required: ["outputPath", "testName"],
            },
          },
          {
            name: "get_implemented_steps",
            description: "実装済みステップを取得",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "プロジェクトパス",
                },
                environment: {
                  type: "string",
                  description: "環境名",
                  default: "default",
                },
              },
              required: ["projectPath"],
            },
          },
        ],
      };
    });

    // ツール実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "create_api_template":
            return await this.createApiTemplateTool.execute(
              args as unknown as CreateApiTemplateArgs
            );
          case "get_implemented_steps":
            return await this.getImplementedStepsTool.execute(
              args as unknown as GetImplementedStepsArgs
            );
          default:
            throw new Error(`未知のツール: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `エラー: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Gauge MCP Server が開始されました");
  }
}

// メイン実行
async function main() {
  const server = new GaugeMCPServer();
  await server.run();
}

main().catch(console.error);
