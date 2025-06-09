import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { GetImplementedStepsTool } from "../../src/tools/get-implemented-steps.js";

// fsモジュールをモック
vi.mock("fs", () => ({
  promises: {
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe("GetImplementedStepsTool", () => {
  let tool: GetImplementedStepsTool;
  const mockFs = fs as any;

  beforeEach(() => {
    tool = new GetImplementedStepsTool();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("execute", () => {
    it("TypeScriptファイルから実装済みステップを取得する", async () => {
      // モックのセットアップ
      mockFs.readdir.mockResolvedValue([
        "step1.ts",
        "step2.js",
        "setup.ts",
        "readme.md",
      ]);

      mockFs.readFile
        .mockResolvedValueOnce('@Step("ログインする")\npublic async login() {}')
        .mockResolvedValueOnce('@Step("検索する")\npublic async search() {}')
        .mockResolvedValueOnce("// setupファイル、ステップなし");

      const args = {
        projectPath: "/test/project",
        environment: "default",
      };

      const result = await tool.execute(args);

      // ファイル読み取りの確認
      expect(mockFs.readdir).toHaveBeenCalledWith("/test/project/steps");
      expect(mockFs.readFile).toHaveBeenCalledTimes(3); // .ts と .js ファイルのみ

      // 結果の確認
      expect(result.content[0].text).toContain("実装済みステップ (2個)");
      expect(result.content[0].text).toContain("• ログインする");
      expect(result.content[0].text).toContain("• 検索する");
    });

    it("ステップファイルが存在しない場合", async () => {
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: "/test/project",
      };

      const result = await tool.execute(args);

      expect(result.content[0].text).toContain("実装済みステップ (0個)");
    });

    it("TypeScript以外のファイルは無視する", async () => {
      mockFs.readdir.mockResolvedValue([
        "step1.ts",
        "config.json",
        "readme.md",
        "step2.js",
      ]);

      mockFs.readFile
        .mockResolvedValueOnce('@Step("ステップ1")\npublic async step1() {}')
        .mockResolvedValueOnce('@Step("ステップ2")\npublic async step2() {}');

      const args = {
        projectPath: "/test/project",
      };

      await tool.execute(args);

      // .ts と .js ファイルのみ読み取り
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it("複数のステップが含まれるファイルを正しく処理する", async () => {
      mockFs.readdir.mockResolvedValue(["multi-step.ts"]);

      const fileContent = `
        @Step("ステップ1")
        public async step1() {}

        @Step("ステップ2")
        public async step2() {}

        @Step("パラメータ付きステップ <param>")
        public async paramStep(param: string) {}
      `;

      mockFs.readFile.mockResolvedValue(fileContent);

      const args = {
        projectPath: "/test/project",
      };

      const result = await tool.execute(args);

      expect(result.content[0].text).toContain("実装済みステップ (3個)");
      expect(result.content[0].text).toContain("• ステップ1");
      expect(result.content[0].text).toContain("• ステップ2");
      expect(result.content[0].text).toContain(
        "• パラメータ付きステップ <param>"
      );
    });

    it("ファイル読み取りエラーの場合", async () => {
      mockFs.readdir.mockRejectedValue(new Error("Directory not found"));

      const args = {
        projectPath: "/test/project",
      };

      await expect(tool.execute(args)).rejects.toThrow("ステップ取得エラー");
    });

    it("環境パラメータを受け取る（現在は使用されていないが）", async () => {
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: "/test/project",
        environment: "production",
      };

      const result = await tool.execute(args);

      expect(result.content[0].text).toContain("実装済みステップ (0個)");
    });
  });
});
