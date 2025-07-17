import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import { GetImplementedStepsTool } from "../../src/tools/get-implemented-steps.js";

// fsモジュールをモック
vi.mock("fs", () => ({
  promises: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
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

      // fs.accessのモック（ディレクトリ存在確認）
      mockFs.access.mockResolvedValue(undefined);

      // fs.readdirのモック（withFileTypesオプション付き）
      mockFs.readdir.mockResolvedValue([
        { name: 'step1.ts', isDirectory: () => false, isFile: () => true },
        { name: 'step2.js', isDirectory: () => false, isFile: () => true },
        { name: 'setup.ts', isDirectory: () => false, isFile: () => true },
        { name: 'readme.md', isDirectory: () => false, isFile: () => true },
      ]);

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
      expect(mockFs.access).toHaveBeenCalledWith(`/test/project`);
      expect(mockFs.readdir).toHaveBeenCalledWith(`/test/project`, { withFileTypes: true });
      expect(mockFs.readFile).toHaveBeenCalledTimes(3); // .ts と .js ファイルのみ

      // 結果の確認
      expect(result.content[0]?.text).toEqual(`* ログインする
* 検索する`);
    });

    it(`ステップファイルが存在しない場合`, async () => {
      // fs.accessのモック（ディレクトリ存在確認）
      mockFs.access.mockResolvedValue(undefined);

      // 空のディレクトリをモック
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: `/test/project`,
      };

      const result = await tool.execute(args);

      expect(result.content[0]?.text).toEqual(`実装済みステップが見つかりませんでした`);
    });

    it(`TypeScript以外のファイルは無視する`, async () => {
      const fileContentMap: Record<string, string> = {
        'step1.ts': `@Step("ステップ1")
public async step1() {}`,
        'step2.js': `@Step("ステップ2")
public async step2() {}`
      };

      // fs.accessのモック（ディレクトリ存在確認）
      mockFs.access.mockResolvedValue(undefined);

      // fs.readdirのモック
      mockFs.readdir.mockResolvedValue([
        { name: 'step1.ts', isDirectory: () => false, isFile: () => true },
        { name: 'config.json', isDirectory: () => false, isFile: () => true },
        { name: 'readme.md', isDirectory: () => false, isFile: () => true },
        { name: 'step2.js', isDirectory: () => false, isFile: () => true },
      ]);

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
      // fs.accessのモック（ディレクトリ存在確認）
      mockFs.access.mockResolvedValue(undefined);

      // fs.readdirのモック
      mockFs.readdir.mockResolvedValue([
        { name: 'multi-step.ts', isDirectory: () => false, isFile: () => true },
      ]);

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
      // fs.accessのモック（ディレクトリが存在しない）
      mockFs.access.mockRejectedValue(new Error(`Directory not found`));

      const args = {
        projectPath: `/test/project`,
      };

      const result = await tool.execute(args);

      // ディレクトリが存在しない場合は適切なメッセージを返す
      expect(result.content[0]?.text).toEqual(`プロジェクトディレクトリが見つかりません: /test/project`);
    });

    it(`環境パラメータを受け取る（現在は使用されていないが）`, async () => {
      // fs.accessのモック（ディレクトリ存在確認）
      mockFs.access.mockResolvedValue(undefined);

      // 空のディレクトリをモック
      mockFs.readdir.mockResolvedValue([]);

      const args = {
        projectPath: `/test/project`,
        environment: `production`,
      };

      const result = await tool.execute(args);

      expect(result.content[0]?.text).toEqual(`実装済みステップが見つかりませんでした`);
    });
  });
});
