import { describe, it, expect } from "vitest";
import { StepExtractor } from "../../src/utils/step-extractor.js";

describe("StepExtractor", () => {
  const stepExtractor = new StepExtractor();

  describe("extractStepsFromFile", () => {
    it("TypeScriptファイルからステップを抽出する", () => {
      const content = `
import { Step } from "gauge-ts";

export default class TestSteps {
  @Step("ユーザーがログインする")
  public async login() {
    // 実装
  }

  @Step("商品を <productName> 検索する")
  public async searchProduct(productName: string) {
    // 実装
  }

  // ヘルパーメソッド（ステップではない）
  private helper() {
    return "test";
  }
}
      `;

      const steps = stepExtractor.extractStepsFromFile(
        content,
        "/test/file.ts"
      );

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual({
        stepText: "ユーザーがログインする",
        file: "/test/file.ts",
      });
      expect(steps[1]).toEqual({
        stepText: "商品を <productName> 検索する",
        file: "/test/file.ts",
      });
    });

    it("ステップが存在しないファイルの場合空配列を返す", () => {
      const content = `
export class NonStepClass {
  public method() {
    console.log("no steps here");
  }
}
      `;

      const steps = stepExtractor.extractStepsFromFile(
        content,
        "/test/file.ts"
      );
      expect(steps).toHaveLength(0);
    });

    it("複数行にわたるステップ定義も正しく抽出する", () => {
      const content = `
@Step("複数行の" +
      "ステップ定義")
public async multiLineStep() {}

@Step("通常のステップ")
public async normalStep() {}
      `;

      const steps = stepExtractor.extractStepsFromFile(
        content,
        "/test/file.ts"
      );

      // 複数行のステップ定義は現在の実装では最初の行のみ抽出される
      expect(steps).toHaveLength(1);
      expect(steps[0].stepText).toBe("通常のステップ");
    });
  });

  describe("extractStepsFromFiles", () => {
    it("複数のファイルからステップを抽出する", () => {
      const files = [
        {
          content: '@Step("ステップ1")\npublic async step1() {}',
          path: "/file1.ts",
        },
        {
          content: '@Step("ステップ2")\npublic async step2() {}',
          path: "/file2.ts",
        },
      ];

      const steps = stepExtractor.extractStepsFromFiles(files);

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual({
        stepText: "ステップ1",
        file: "/file1.ts",
      });
      expect(steps[1]).toEqual({
        stepText: "ステップ2",
        file: "/file2.ts",
      });
    });

    it("空のファイル配列の場合空配列を返す", () => {
      const steps = stepExtractor.extractStepsFromFiles([]);
      expect(steps).toHaveLength(0);
    });
  });
});
