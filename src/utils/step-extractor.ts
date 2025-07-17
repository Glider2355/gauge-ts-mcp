export interface StepInfo {
  stepText: string;
  file: string;
}

export class StepExtractor {
  extractStepsFromFile(content: string, filePath: string): StepInfo[] {
    const stepRegex = /@Step\((['"])([^'"]+)\1\)/g;
    const steps: StepInfo[] = [];
    let match;

    while ((match = stepRegex.exec(content)) !== null) {
      if (match[2]) {
        steps.push({
          stepText: match[2],
          file: filePath,
        });
      }
    }

    return steps;
  }

  extractStepsFromFiles(
    files: Array<{ content: string; path: string }>
  ): StepInfo[] {
    const allSteps: StepInfo[] = [];

    for (const file of files) {
      const steps = this.extractStepsFromFile(file.content, file.path);
      allSteps.push(...steps);
    }

    return allSteps;
  }
}
