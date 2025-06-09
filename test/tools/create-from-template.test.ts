import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { CreateFromTemplateTool } from "../../src/tools/create-from-template.js";

// fsモジュールをモック
vi.mock("fs", () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
}));

describe("CreateFromTemplateTool", () => {
  let tool: CreateFromTemplateTool;
  const mockFs = fs as any;

  beforeEach(() => {
    tool = new CreateFromTemplateTool();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("execute", () => {
    it("basic-webテンプレートからファイルを作成する", async () => {
      const args = {
        projectPath: "/test/project",
        templateName: "basic-web",
        projectName: "MyProject",
        includeSetup: true,
      };

      const result = await tool.execute(args);

      // ディレクトリ作成の確認
      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/project/specs", {
        recursive: true,
      });
      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/project/steps", {
        recursive: true,
      });

      // ファイル作成の確認
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3); // spec, steps, setup

      // specファイル
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        "/test/project/specs/myproject.spec",
        expect.stringContaining("# MyProject テスト仕様書"),
        "utf8"
      );

      // stepsファイル
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        "/test/project/steps/MyProjectSteps.ts",
        expect.stringContaining("MyProjectSteps"),
        "utf8"
      );

      // setupファイル
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        "/test/project/steps/setup.ts",
        expect.stringContaining("beforeSuite"),
        "utf8"
      );

      // 結果の確認
      expect(result.content[0].text).toContain(
        'テンプレート "basic-web" からファイルを作成しました'
      );
    });

    it("includeSetup=falseの場合setupファイルを作成しない", async () => {
      const args = {
        projectPath: "/test/project",
        templateName: "basic-web",
        projectName: "MyProject",
        includeSetup: false,
      };

      await tool.execute(args);

      expect(mockFs.writeFile).toHaveBeenCalledTimes(2); // spec, stepsのみ
      expect(mockFs.writeFile).not.toHaveBeenCalledWith(
        expect.stringContaining("setup.ts"),
        expect.anything(),
        expect.anything()
      );
    });

    it("存在しないテンプレート名の場合エラーを投げる", async () => {
      const args = {
        projectPath: "/test/project",
        templateName: "non-existent",
        projectName: "MyProject",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "不明なテンプレート: non-existent"
      );
    });

    it("ファイル作成に失敗した場合エラーを投げる", async () => {
      mockFs.writeFile.mockRejectedValue(new Error("Permission denied"));

      const args = {
        projectPath: "/test/project",
        templateName: "basic-web",
        projectName: "MyProject",
      };

      await expect(tool.execute(args)).rejects.toThrow("ファイル作成エラー");
    });

    it("web-ecommerceテンプレートを正しく処理する", async () => {
      const args = {
        projectPath: "/test/project",
        templateName: "web-ecommerce",
        projectName: "ECommerceProject",
      };

      const result = await tool.execute(args);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        "/test/project/specs/ecommerceproject.spec",
        expect.stringContaining("ECサイトテスト"),
        "utf8"
      );

      expect(result.content[0].text).toContain(
        'テンプレート "web-ecommerce" からファイルを作成しました'
      );
    });
  });
});
