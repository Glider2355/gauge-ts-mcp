import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface CreateApiTemplateArgs {
  outputPath: string;
  testName: string;
}

export class CreateApiTemplateTool {
  async execute(args: CreateApiTemplateArgs) {
    const { outputPath, testName } = args;

    try {
      // gauge-ts-mcpプロジェクトのソースディレクトリからテンプレートを取得
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const projectRoot = join(__dirname, "../..");
      const apiTemplateDir = join(projectRoot, "src/templates/api");
      const destDir = join(outputPath, testName);

      // プロジェクトディレクトリが存在することを確認
      await fs.mkdir(destDir, { recursive: true });

      // APIテンプレートをコピー
      await this.copyDirectory(apiTemplateDir, destDir);

      return {
        content: [
          {
            type: "text" as const,
            text:
              `APIテストテンプレートを正常に作成しました:\n` +
              `テスト名: ${testName}\n` +
              `作成先: ${destDir}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `APIテンプレート作成エラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async copyDirectory(
    source: string,
    destination: string
  ): Promise<void> {
    try {
      // ソースディレクトリの内容を読み取り
      const items = await fs.readdir(source);

      for (const item of items) {
        // .gitkeepファイルは除外
        if (item === '.gitkeep') {
          continue;
        }

        const sourcePath = join(source, item);
        const destPath = join(destination, item);
        const stat = await fs.stat(sourcePath);

        if (stat.isDirectory()) {
          // ディレクトリの場合は再帰的にコピー
          await fs.mkdir(destPath, { recursive: true });
          await this.copyDirectory(sourcePath, destPath);
        } else {
          // ファイルの場合はコピー
          await fs.copyFile(sourcePath, destPath);
        }
      }
    } catch (error) {
      throw new Error(
        `ディレクトリコピーエラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

}
