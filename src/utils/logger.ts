const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogData {
  level: LogLevel;
  message: string;
  source: "frontend";
  page?: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async sendToBackend(data: LogData): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...data,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Không log lỗi của logger để tránh vòng lặp
      console.error("Failed to send log to backend:", error);
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`ℹ️ ${message}`, meta);
    if (this.enabled) {
      this.sendToBackend({
        level: "info",
        message,
        source: "frontend",
        meta,
      });
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`⚠️ ${message}`, meta);
    if (this.enabled) {
      this.sendToBackend({
        level: "warn",
        message,
        source: "frontend",
        meta,
      });
    }
  }

  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void {
    console.error(`❌ ${message}`, error, meta);

    let stack: string | undefined;
    if (error instanceof Error) {
      stack = error.stack;
    }

    if (this.enabled) {
      this.sendToBackend({
        level: "error",
        message,
        source: "frontend",
        stack,
        meta: {
          ...meta,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`🐛 ${message}`, meta);
    if (this.enabled) {
      this.sendToBackend({
        level: "debug",
        message,
        source: "frontend",
        meta,
      });
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const logger = Logger.getInstance();

// Global error handler
window.addEventListener("error", (event) => {
  logger.error("Uncaught error", event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled promise rejection", event.reason);
});
