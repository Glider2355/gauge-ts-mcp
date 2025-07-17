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
      const stepsDir = join(projectPath, "steps");
      const files = await fs.readdir(stepsDir);
      const tsFiles = files.filter(
        (f) => f.endsWith(".ts") || f.endsWith(".js")
      );

      const allSteps: StepInfo[] = [];

      for (const file of tsFiles) {
        const filePath = join(stepsDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const steps = this.stepExtractor.extractStepsFromFile(
          content,
          filePath
        );
        allSteps.push(...steps);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `${allSteps.map((step) => `* ${step.stepText}`).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `ステップ取得エラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
