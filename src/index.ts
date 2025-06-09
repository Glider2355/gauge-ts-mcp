#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  CreateFromTemplateTool,
  CreateFromTemplateArgs,
} from "./tools/create-from-template.js";
import {
  GetImplementedStepsTool,
  GetImplementedStepsArgs,
} from "./tools/get-implemented-steps.js";
import { RunGaugeTool, RunGaugeArgs } from "./tools/run-gauge.js";
import { getAvailableTemplates } from "./templates/index.js";

class GaugeMCPServer {
  private server: Server;
  private createFromTemplateTool: CreateFromTemplateTool;
  private getImplementedStepsTool: GetImplementedStepsTool;
  private runGaugeTool: RunGaugeTool;

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
    this.createFromTemplateTool = new CreateFromTemplateTool();
    this.getImplementedStepsTool = new GetImplementedStepsTool();
    this.runGaugeTool = new RunGaugeTool();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // ツール一覧の設定
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_from_template",
            description: "テンプレートからGaugeプロジェクトファイルを作成",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "プロジェクトパス",
                },
                templateName: {
                  type: "string",
                  description: "テンプレート名",
                  enum: getAvailableTemplates(),
                  default: "basic-web",
                },
                projectName: {
                  type: "string",
                  description: "プロジェクト名",
                },
                includeSetup: {
                  type: "boolean",
                  description: "setup.tsを含める",
                  default: true,
                },
              },
              required: ["projectPath", "projectName"],
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
          {
            name: "run_gauge",
            description: "Gaugeコマンドを実行",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "プロジェクトパス",
                },
                command: {
                  type: "string",
                  description: "コマンド",
                  enum: ["run", "validate", "install", "version"],
                  default: "run",
                },
                specPath: {
                  type: "string",
                  description: "スペックパス",
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
          case "create_from_template":
            return await this.createFromTemplateTool.execute(
              args as unknown as CreateFromTemplateArgs
            );
          case "get_implemented_steps":
            return await this.getImplementedStepsTool.execute(
              args as unknown as GetImplementedStepsArgs
            );
          case "run_gauge":
            return await this.runGaugeTool.execute(
              args as unknown as RunGaugeArgs
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
