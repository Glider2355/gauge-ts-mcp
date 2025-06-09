import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { spawn } from "child_process";
import { CommandExecutor } from "../../src/utils/command-executor.js";

// child_processモジュールをモック
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

describe("CommandExecutor", () => {
  let commandExecutor: CommandExecutor;
  let mockSpawn: any;
  let mockChild: any;

  beforeEach(() => {
    commandExecutor = new CommandExecutor();
    mockSpawn = spawn as any;

    // モックの子プロセス
    mockChild = {
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn(),
    };

    mockSpawn.mockReturnValue(mockChild);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("execute", () => {
    it("成功したコマンドの出力を返す", async () => {
      // stdoutからのデータイベントをシミュレート
      mockChild.stdout.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === "data") {
            setTimeout(() => callback(Buffer.from("Command output")), 10);
          }
        }
      );

      // 正常終了をシミュレート
      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "close") {
          setTimeout(() => callback(0), 20);
        }
      });

      const promise = commandExecutor.execute("test-command", ["arg1", "arg2"]);
      const result = await promise;

      expect(mockSpawn).toHaveBeenCalledWith("test-command", ["arg1", "arg2"], {
        cwd: undefined,
        stdio: ["ignore", "pipe", "pipe"],
      });

      expect(result).toBe("Command output");
    });

    it("カスタムcwdオプションでコマンドを実行する", async () => {
      mockChild.stdout.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === "data") {
            setTimeout(() => callback(Buffer.from("Output")), 10);
          }
        }
      );

      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "close") {
          setTimeout(() => callback(0), 20);
        }
      });

      await commandExecutor.execute("ls", ["-la"], { cwd: "/custom/path" });

      expect(mockSpawn).toHaveBeenCalledWith("ls", ["-la"], {
        cwd: "/custom/path",
        stdio: ["ignore", "pipe", "pipe"],
      });
    });

    it("コマンドが非ゼロで終了した場合エラーを投げる", async () => {
      // stderrからのデータ
      mockChild.stderr.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === "data") {
            setTimeout(() => callback(Buffer.from("Error message")), 10);
          }
        }
      );

      // 非ゼロ終了をシミュレート
      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "close") {
          setTimeout(() => callback(1), 20);
        }
      });

      await expect(
        commandExecutor.execute("failing-command", [])
      ).rejects.toThrow("コマンド失敗 (code: 1): Error message");
    });

    it("プロセス生成エラーの場合エラーを投げる", async () => {
      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "error") {
          setTimeout(() => callback(new Error("Command not found")), 10);
        }
      });

      await expect(
        commandExecutor.execute("non-existent-command", [])
      ).rejects.toThrow("Command not found");
    });

    it("複数回のデータイベントを正しく処理する", async () => {
      let dataCallback: Function;

      mockChild.stdout.on.mockImplementation(
        (event: string, callback: Function) => {
          if (event === "data") {
            dataCallback = callback;
          }
        }
      );

      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "close") {
          setTimeout(() => {
            // 複数回データを送信
            dataCallback(Buffer.from("First "));
            dataCallback(Buffer.from("Second "));
            dataCallback(Buffer.from("Third"));
            callback(0);
          }, 10);
        }
      });

      const result = await commandExecutor.execute("multi-output", []);
      expect(result).toBe("First Second Third");
    });

    it("空の出力でも正しく処理する", async () => {
      mockChild.on.mockImplementation((event: string, callback: Function) => {
        if (event === "close") {
          setTimeout(() => callback(0), 10);
        }
      });

      const result = await commandExecutor.execute("empty-output", []);
      expect(result).toBe("");
    });
  });
});
