import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import { CreateFromTemplateTool } from "../../src/tools/create-from-template.js";

// fsモジュールをモック
vi.mock("fs", () => ({
  promises: {
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    copyFile: vi.fn(),
  },
}));

// pathモジュールをモック
vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
  dirname: vi.fn(() => "/mock/src/tools"),
}));

// URLモジュールをモック
vi.mock("url", () => ({
  fileURLToPath: vi.fn(() => "/mock/src/tools/create-from-template.js"),
}));

describe("CreateFromTemplateTool", () => {
  let tool: CreateFromTemplateTool;
  const mockFs = fs as any;

  beforeEach(() => {
    tool = new CreateFromTemplateTool();
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockFs.readdir.mockResolvedValue([
      "basic-web.ts",
      "web-ecommerce.ts",
      "api-testing.ts",
      "index.ts",
    ]);

    mockFs.stat.mockResolvedValue({
      isDirectory: () => false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("execute", () => {
    it("templatesフォルダを正常にコピーする", async () => {
      const args = {
        projectPath: "/test/project",
      };

      const result = await tool.execute(args);

      // プロジェクトディレクトリの作成確認
      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/project", {
        recursive: true,
      });

      // templatesディレクトリの作成確認
      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/project/templates", {
        recursive: true,
      });

      // ソースディレクトリの読み取り確認
      expect(mockFs.readdir).toHaveBeenCalledWith(
        "/mock/src/tools/../templates"
      );

      // ファイルコピーの確認
      expect(mockFs.copyFile).toHaveBeenCalledTimes(4);
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/basic-web.ts",
        "/test/project/templates/basic-web.ts"
      );
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/web-ecommerce.ts",
        "/test/project/templates/web-ecommerce.ts"
      );
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/api-testing.ts",
        "/test/project/templates/api-testing.ts"
      );
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/index.ts",
        "/test/project/templates/index.ts"
      );

      // 結果メッセージの確認
      expect(result.content[0].text).toContain(
        "テンプレートフォルダを正常にコピーしました"
      );
      expect(result.content[0].text).toContain(
        "コピー元: /mock/src/tools/../templates"
      );
      expect(result.content[0].text).toContain(
        "コピー先: /test/project/templates"
      );
      expect(result.content[0].text).toContain("basic-web.ts");
      expect(result.content[0].text).toContain("web-ecommerce.ts");
      expect(result.content[0].text).toContain("api-testing.ts");
      expect(result.content[0].text).toContain("index.ts");
    });

    it("ディレクトリ作成に失敗した場合エラーを投げる", async () => {
      mockFs.mkdir.mockRejectedValue(new Error("Permission denied"));

      const args = {
        projectPath: "/test/project",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "テンプレートフォルダのコピーエラー"
      );
    });

    it("ファイル読み取りに失敗した場合エラーを投げる", async () => {
      mockFs.readdir.mockRejectedValue(new Error("Directory not found"));

      const args = {
        projectPath: "/test/project",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "テンプレートフォルダのコピーエラー"
      );
    });

    it("ファイルコピーに失敗した場合エラーを投げる", async () => {
      mockFs.copyFile.mockRejectedValue(new Error("Copy failed"));

      const args = {
        projectPath: "/test/project",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "テンプレートフォルダのコピーエラー"
      );
    });

    it("空のプロジェクトパスでもエラーを投げない", async () => {
      const args = {
        projectPath: "",
      };

      const result = await tool.execute(args);

      expect(result.content[0].text).toContain(
        "テンプレートフォルダを正常にコピーしました"
      );
    });
  });
});
