import { describe, it, expect, beforeEach, vi } from "vitest";
// import { CreateApiTemplateTool } from "../../src/tools/create-api-template.js";

vi.mock("fs");
vi.mock("path");
vi.mock("url");

describe.skip("CreateApiTemplateTool", () => {
  let tool: CreateApiTemplateTool;
  let mockFs: any;
  let mockPath: any;
  let mockUrl: any;

  beforeEach(async () => {
    // モジュールをインポート
    const fs = await import("fs");
    const path = await import("path");
    const url = await import("url");
    
    mockFs = fs.promises;
    mockPath = path;
    mockUrl = url;

    // パスモジュールのモック設定
    vi.mocked(mockPath.join).mockImplementation((...args: string[]) => args.join("/"));
    vi.mocked(mockPath.dirname).mockReturnValue("/mock/src/tools");
    
    // URLモジュールのモック設定
    vi.mocked(mockUrl.fileURLToPath).mockReturnValue("/mock/src/tools/create-api-template.js");

    tool = new CreateApiTemplateTool();
    vi.clearAllMocks();

    // デフォルトのモック設定
    vi.mocked(mockFs.readdir).mockImplementation((path: string) => {
      if (path.includes("templates/api")) {
        return Promise.resolve([
          "expected-value",
          "query",
          "request-path",
          "request",
          "test.spec",
          "setup.ts",
        ]);
      }
      if (path.includes("expected-value")) {
        return Promise.resolve(["expected.ts"]);
      }
      if (path.includes("query")) {
        return Promise.resolve(["query.ts"]);
      }
      if (path.includes("request-path")) {
        return Promise.resolve(["path.ts"]);
      }
      if (path.includes("request")) {
        return Promise.resolve(["request.ts"]);
      }
      return Promise.resolve([]);
    });

    vi.mocked(mockFs.stat).mockImplementation((path: string) => {
      const isDir = 
        (path.includes("expected-value") ||
         path.includes("query") ||
         path.includes("request-path") ||
         path.includes("request")) &&
        !path.endsWith(".ts");
      return Promise.resolve({
        isDirectory: () => isDir,
      });
    });

    vi.mocked(mockFs.mkdir).mockResolvedValue(undefined);
    vi.mocked(mockFs.copyFile).mockResolvedValue(undefined);
  });

  describe("execute", () => {
    it("APIテンプレートを正常に作成する", async () => {
      const args = {
        outputPath: "/test",
        testName: "my-api-project",
      };

      const result = await tool.execute(args);

      // プロジェクトディレクトリの作成確認
      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/my-api-project", {
        recursive: true,
      });

      // test.specファイルのコピー確認
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/api/test.spec",
        "/test/my-api-project/test.spec"
      );

      // setup.tsファイルのコピー確認
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/api/setup.ts",
        "/test/my-api-project/setup.ts"
      );

      // 結果メッセージの確認
      expect(result.content[0].text).toContain(
        "APIテストテンプレートを正常に作成しました"
      );
      expect(result.content[0].text).toContain("テスト名: my-api-project");
      expect(result.content[0].text).toContain("作成先: /test/my-api-project");
    });

    it("サブディレクトリを含むテンプレートを正常にコピーする", async () => {
      const args = {
        outputPath: "/test",
        testName: "my-api-project",
      };

      await tool.execute(args);

      // サブディレクトリの作成確認
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        "/test/my-api-project/expected-value",
        { recursive: true }
      );

      // サブディレクトリ内のファイルのコピー確認
      expect(mockFs.copyFile).toHaveBeenCalledWith(
        "/mock/src/tools/../templates/api/expected-value/expected.ts",
        "/test/my-api-project/expected-value/expected.ts"
      );
    });

    it("ディレクトリ作成に失敗した場合エラーを投げる", async () => {
      vi.mocked(mockFs.mkdir).mockRejectedValue(new Error("Permission denied"));

      const args = {
        outputPath: "/test",
        testName: "my-api-project",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "APIテンプレート作成エラー: Permission denied"
      );
    });

    it("ファイル読み取りに失敗した場合エラーを投げる", async () => {
      vi.mocked(mockFs.readdir).mockRejectedValue(new Error("Directory not found"));

      const args = {
        outputPath: "/test",
        testName: "my-api-project",
      };

      await expect(tool.execute(args)).rejects.toThrow(
        "APIテンプレート作成エラー"
      );
    });

    it("長いプロジェクト名でも正常に処理する", async () => {
      const args = {
        outputPath: "/test",
        testName: "my-very-long-api-project-name-with-many-words",
      };

      const result = await tool.execute(args);

      expect(result.content[0].text).toContain(
        "テスト名: my-very-long-api-project-name-with-many-words"
      );
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        "/test/my-very-long-api-project-name-with-many-words",
        { recursive: true }
      );
    });
  });
});