type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function resolveLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVEL_ORDER) return env as LogLevel;
  if (process.env.NODE_ENV === "test") return "silent";
  return "info";
}

function serializeValue(val: unknown): unknown {
  if (val instanceof Error) {
    return {
      name: val.name,
      message: val.message,
      ...(process.env.NODE_ENV !== "production" && val.stack ? { stack: val.stack } : {}),
    };
  }
  return val;
}

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  try {
    return " " + JSON.stringify(meta, (_key, val) => serializeValue(val));
  } catch {
    return " [Unserializable meta]";
  }
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

/**
 * Create a namespaced logger. The `module` tag appears in every line,
 * making it easy to grep logs (e.g. `[db]`, `[api:upload]`, `[ai]`).
 */
export function createLogger(module: string): Logger {
  const threshold = LEVEL_ORDER[resolveLevel()];

  function emit(
    level: LogLevel,
    consoleFn: (...args: unknown[]) => void,
    msg: string,
    meta?: Record<string, unknown>,
  ): void {
    if (LEVEL_ORDER[level] < threshold) return;
    const ts = new Date().toISOString();
    consoleFn(`${ts} [${level.toUpperCase()}] [${module}] ${msg}${formatMeta(meta)}`);
  }

  return {
    debug(msg, meta) {
      emit("debug", console.debug, msg, meta);
    },
    info(msg, meta) {
      emit("info", console.info, msg, meta);
    },
    warn(msg, meta) {
      emit("warn", console.warn, msg, meta);
    },
    error(msg, meta) {
      emit("error", console.error, msg, meta);
    },
  };
}
