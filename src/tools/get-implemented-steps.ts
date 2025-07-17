import { promises as fs } from "fs";
import { join } from "path";
import { StepExtractor, StepInfo } from "../utils/step-extractor.js";

export interface GetImplementedStepsArgs {
  projectPath: string;
  environment?: string;
}

export class GetImplementedStepsTool {
  private stepExtractor: StepExtractor;

  constructor() {
    this.stepExtractor = new StepExtractor();
  }

  async execute(args: GetImplementedStepsArgs) {
    const { projectPath } = args;

    try {
      // プロジェクトディレクトリの存在確認
      try {
        await fs.access(projectPath);
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `プロジェクトディレクトリが見つかりません: ${projectPath}`,
            },
          ],
        };
      }

      // 再帰的にts/jsファイルを検索
      const allTsJsFiles = await this.findTsJsFiles(projectPath);

      const allSteps: StepInfo[] = [];

      for (const filePath of allTsJsFiles) {
        const content = await fs.readFile(filePath, "utf8");
        const steps = this.stepExtractor.extractStepsFromFile(
          content,
          filePath
        );
        allSteps.push(...steps);
      }

      const resultText = allSteps.length > 0
        ? allSteps.map((step) => `* ${step.stepText}`).join("\n")
        : "実装済みステップが見つかりませんでした";

      return {
        content: [
          {
            type: "text" as const,
            text: resultText,
          },
        ],
      };
    } catch (error) {
      const errorMessage = `ステップ取得エラー: ${
        error instanceof Error ? error.message : String(error)
      }`;

      throw new Error(errorMessage);
    }
  }

  // 再帰的にts/jsファイルを検索するヘルパーメソッド
  private async findTsJsFiles(dirPath: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // node_modules、.git、buildディレクトリは除外
          if (!['node_modules', '.git', 'build', 'dist'].includes(entry.name)) {
            const subResults = await this.findTsJsFiles(fullPath);
            results.push(...subResults);
          }
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // ディレクトリ読み取りエラーは静かに無視
    }

    return results;
  }
}
