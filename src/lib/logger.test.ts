import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger } from "./logger";

describe("createLogger", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("emits logs with timestamp, level, module tag, and message", () => {
    process.env.LOG_LEVEL = "debug";
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const log = createLogger("test-module");
    log.info("test message");

    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toMatch(/\[INFO\] \[test-module\] test message/);
  });

  it("safely serializes metadata and Error objects", () => {
    process.env.LOG_LEVEL = "debug";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const log = createLogger("test-module");
    const testError = new Error("Something broke");
    log.error("action failed", { error: testError, count: 5 });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("action failed");
    expect(output).toContain('"count":5');
    expect(output).toContain('"message":"Something broke"');
    expect(output).toContain('"name":"Error"');
  });

  it("suppresses logs below threshold level", () => {
    process.env.LOG_LEVEL = "warn";
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const log = createLogger("test-module");
    log.info("should not appear");
    log.warn("should appear");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
