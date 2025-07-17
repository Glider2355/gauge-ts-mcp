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
    it(`TypeScriptファイルから実装済みステップを取得する`, async () => {
      // モックのセットアップ
      const mockFiles = [
        `step1.ts`,
        `step2.js`,
        `setup.ts`,
        `readme.md`,
      ];

      const fileContentMap: Record<string, string> = {
        'step1.ts': `@Step("ログインする")
public async login() {}`,
        'step2.js': `@Step("検索する")
public async search() {}`,
        'setup.ts': `// setupファイル、ステップなし`
      };

      mockFs.readdir.mockResolvedValue(mockFiles);

      mockFs.readFile.mockImplementation((filePath: string) => {
        const fileName = Object.keys(fileContentMap).find(name => filePath.includes(name));
        return Promise.resolve(fileName ? fileContentMap[fileName] : ``);
      });

      const args = {
        projectPath: `/test/project`,
        environment: `default`,
      };

      const result = await tool.execute(args);

      // ファイル読み取りの確認
      expect(mockFs.readdir).toHaveBeenCalledWith(`/test/project/steps`);
      expect(mockFs.readFile).toHaveBeenCalledTimes(3); // .ts と .js ファイルのみ

      // 結果の確認
      expect(result.content[0]?.text).toEqual('* ログインする\n* 検索する');
    });

    it(`ステップファイルが存在しない場合`, async () => {
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: `/test/project`,
      };

      const result = await tool.execute(args);

      expect(result.content[0]?.text).toEqual(``);
    });

    it(`TypeScript以外のファイルは無視する`, async () => {
      const mockFiles = [
        `step1.ts`,
        `config.json`,
        `readme.md`,
        `step2.js`,
      ];

      const fileContentMap: Record<string, string> = {
        'step1.ts': `@Step("ステップ1")
public async step1() {}`,
        'step2.js': `@Step("ステップ2")
public async step2() {}`
      };

      mockFs.readdir.mockResolvedValue(mockFiles);

      mockFs.readFile.mockImplementation((filePath: string) => {
        const fileName = Object.keys(fileContentMap).find(name => filePath.includes(name));
        return Promise.resolve(fileName ? fileContentMap[fileName] : ``);
      });

      const args = {
        projectPath: `/test/project`,
      };

      await tool.execute(args);

      // .ts と .js ファイルのみ読み取り
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it(`複数のステップが含まれるファイルを正しく処理する`, async () => {
      mockFs.readdir.mockResolvedValue([`multi-step.ts`]);

      const fileContent = `
@Step("ステップ1")
public async step1() {}

@Step("ステップ2")
public async step2() {}

@Step("パラメータ付きステップ <param>")
public async paramStep(param: string) {}`;

      mockFs.readFile.mockResolvedValue(fileContent);

      const args = {
        projectPath: `/test/project`,
      };

      const result = await tool.execute(args);

      expect(result.content[0]?.text).toEqual(
        `* ステップ1
* ステップ2
* パラメータ付きステップ <param>`
      );
    });

    it(`ファイル読み取りエラーの場合`, async () => {
      mockFs.readdir.mockRejectedValue(new Error(`Directory not found`));

      const args = {
        projectPath: `/test/project`,
      };

      await expect(tool.execute(args)).rejects.toThrow(`ステップ取得エラー`);
    });

    it(`環境パラメータを受け取る（現在は使用されていないが）`, async () => {
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: `/test/project`,
        environment: `production`,
      };

      const result = await tool.execute(args);

      expect(result.content[0]?.text).toEqual(``);
    });
  });
});
