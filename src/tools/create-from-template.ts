import { promises as fs } from "fs";
import { join } from "path";
import { getTemplate } from "../templates/index.js";

export interface CreateFromTemplateArgs {
  projectPath: string;
  templateName: string;
  projectName: string;
  includeSetup?: boolean;
}

export class CreateFromTemplateTool {
  async execute(args: CreateFromTemplateArgs) {
    const {
      projectPath,
      templateName,
      projectName,
      includeSetup = true,
    } = args;

    const template = getTemplate(templateName);
    if (!template) {
      throw new Error(`不明なテンプレート: ${templateName}`);
    }

    const results: string[] = [];

    try {
      // specsディレクトリ作成
      const specsDir = join(projectPath, "specs");
      await fs.mkdir(specsDir, { recursive: true });

      // spec ファイル作成
      const specFile = join(specsDir, `${projectName.toLowerCase()}.spec`);
      await fs.writeFile(specFile, template.specContent(projectName), "utf8");
      results.push(`✓ Specファイルを作成: ${specFile}`);

      // stepsディレクトリ作成
      const stepsDir = join(projectPath, "steps");
      await fs.mkdir(stepsDir, { recursive: true });

      // steps ファイル作成
      const stepsFile = join(stepsDir, `${projectName}Steps.ts`);
      await fs.writeFile(stepsFile, template.stepsContent(projectName), "utf8");
      results.push(`✓ Stepsファイルを作成: ${stepsFile}`);

      // setup.ts 作成
      if (includeSetup) {
        const setupFile = join(stepsDir, "setup.ts");
        await fs.writeFile(setupFile, template.setupContent(), "utf8");
        results.push(`✓ Setupファイルを作成: ${setupFile}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `テンプレート "${templateName}" からファイルを作成しました:\n\n${results.join(
              "\n"
            )}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `ファイル作成エラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
