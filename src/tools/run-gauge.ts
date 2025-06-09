import { CommandExecutor } from "../utils/command-executor.js";

export interface RunGaugeArgs {
  projectPath: string;
  command?: string;
  specPath?: string;
  environment?: string;
}

export class RunGaugeTool {
  private commandExecutor: CommandExecutor;

  constructor() {
    this.commandExecutor = new CommandExecutor();
  }

  async execute(args: RunGaugeArgs) {
    const {
      projectPath,
      command = "run",
      specPath,
      environment = "default",
    } = args;

    const gaugeArgs = [command];

    if (command === "run") {
      if (specPath) gaugeArgs.push(specPath);
      gaugeArgs.push("--env", environment);
    }

    try {
      const output = await this.commandExecutor.execute("gauge", gaugeArgs, {
        cwd: projectPath,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Gauge ${command} コマンドの実行結果:\n\n${output}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Gauge実行エラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
