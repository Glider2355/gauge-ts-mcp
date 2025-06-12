import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface CreateFromTemplateArgs {
  projectPath: string;
  templateName?: string;
  projectName?: string;
  includeSetup?: boolean;
}

export class CreateFromTemplateTool {
  async execute(args: CreateFromTemplateArgs) {
    const { projectPath } = args;

    try {
      // 現在のモジュールのディレクトリを取得
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const templatesSourceDir = join(__dirname, "../templates");
      const templatesDestDir = join(projectPath, "templates");

      // プロジェクトディレクトリが存在することを確認
      await fs.mkdir(projectPath, { recursive: true });

      // templatesディレクトリをコピー
      await this.copyDirectory(templatesSourceDir, templatesDestDir);

      return {
        content: [
          {
            type: "text" as const,
            text:
              `テンプレートフォルダを正常にコピーしました:\n` +
              `コピー元: ${templatesSourceDir}\n` +
              `コピー先: ${templatesDestDir}\n\n` +
              `使用可能なテンプレート:\n` +
              `- basic-web.ts\n` +
              `- web-ecommerce.ts\n` +
              `- api-testing.ts\n` +
              `- index.ts`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `テンプレートフォルダのコピーエラー: ${
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
      // 目的地ディレクトリを作成
      await fs.mkdir(destination, { recursive: true });

      // ソースディレクトリの内容を読み取り
      const items = await fs.readdir(source);

      for (const item of items) {
        const sourcePath = join(source, item);
        const destPath = join(destination, item);

        const stat = await fs.stat(sourcePath);

        if (stat.isDirectory()) {
          // ディレクトリの場合は再帰的にコピー
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
