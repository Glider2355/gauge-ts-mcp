import { spawn } from "child_process";

export interface CommandExecutorOptions {
  cwd?: string;
}

export class CommandExecutor {
  async execute(
    command: string,
    args: string[],
    options: CommandExecutorOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`コマンド失敗 (code: ${code}): ${stderr}`));
        } else {
          resolve(stdout);
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }
}
