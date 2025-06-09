import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RunGaugeTool } from "../../src/tools/run-gauge.js";
import { CommandExecutor } from "../../src/utils/command-executor.js";

// CommandExecutorをモック
vi.mock("../../src/utils/command-executor.js", () => ({
  CommandExecutor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

describe("RunGaugeTool", () => {
  let tool: RunGaugeTool;
  let mockCommandExecutor: any;

  beforeEach(() => {
    const MockedCommandExecutor = CommandExecutor as any;
    mockCommandExecutor = {
      execute: vi.fn(),
    };
    MockedCommandExecutor.mockImplementation(() => mockCommandExecutor);

    tool = new RunGaugeTool();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("execute", () => {
    it("基本的なrunコマンドを実行する", async () => {
      mockCommandExecutor.execute.mockResolvedValue(
        "Test execution completed successfully"
      );

      const args = {
        projectPath: "/test/project",
        command: "run",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["run", "--env", "default"],
        { cwd: "/test/project" }
      );

      expect(result.content[0].text).toContain("Gauge run コマンドの実行結果");
      expect(result.content[0].text).toContain(
        "Test execution completed successfully"
      );
    });

    it("specPathを指定してrunコマンドを実行する", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Spec execution completed");

      const args = {
        projectPath: "/test/project",
        command: "run",
        specPath: "specs/login.spec",
        environment: "qa",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["run", "specs/login.spec", "--env", "qa"],
        { cwd: "/test/project" }
      );
    });

    it("validateコマンドを実行する", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Validation successful");

      const args = {
        projectPath: "/test/project",
        command: "validate",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["validate"],
        { cwd: "/test/project" }
      );

      expect(result.content[0].text).toContain(
        "Gauge validate コマンドの実行結果"
      );
    });

    it("versionコマンドを実行する", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Gauge version 1.4.3");

      const args = {
        projectPath: "/test/project",
        command: "version",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["version"],
        { cwd: "/test/project" }
      );

      expect(result.content[0].text).toContain(
        "Gauge version コマンドの実行結果"
      );
      expect(result.content[0].text).toContain("Gauge version 1.4.3");
    });

    it("installコマンドを実行する", async () => {
      mockCommandExecutor.execute.mockResolvedValue(
        "Plugin installed successfully"
      );

      const args = {
        projectPath: "/test/project",
        command: "install",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["install"],
        { cwd: "/test/project" }
      );
    });

    it("デフォルトコマンドはrunになる", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Default run execution");

      const args = {
        projectPath: "/test/project",
      };

      const result = await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["run", "--env", "default"],
        { cwd: "/test/project" }
      );
    });

    it("デフォルト環境はdefaultになる", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Environment test");

      const args = {
        projectPath: "/test/project",
        command: "run",
      };

      await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["run", "--env", "default"],
        { cwd: "/test/project" }
      );
    });

    it("runコマンド以外の場合環境オプションを追加しない", async () => {
      mockCommandExecutor.execute.mockResolvedValue("Validation result");

      const args = {
        projectPath: "/test/project",
        command: "validate",
        environment: "test",
      };

      await tool.execute(args);

      expect(mockCommandExecutor.execute).toHaveBeenCalledWith(
        "gauge",
        ["validate"],
        { cwd: "/test/project" }
      );
    });

    it("コマンド実行エラーの場合", async () => {
      mockCommandExecutor.execute.mockRejectedValue(
        new Error("Gauge command failed")
      );

      const args = {
        projectPath: "/test/project",
        command: "run",
      };

      await expect(tool.execute(args)).rejects.toThrow("Gauge実行エラー");
    });
  });
});
