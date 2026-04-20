import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { SessionInfo, SessionStatus } from "../types/settings";
import {
  launchClaudeSession,
  getStatusFilePath,
  ensureStatusDir,
} from "./terminal-launcher";

class SessionManagerService {
  private sessions = new Map<string, SessionInfo>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(id: string, status: SessionStatus) => void> = [];

  async launch(
    projectPath: string,
    sessionName: string,
    tabColor: string
  ): Promise<string> {
    const id = randomUUID();

    const info: SessionInfo = {
      id,
      name: sessionName || "Claude",
      projectPath,
      tabColor,
      status: "launching",
      startedAt: new Date(),
    };

    this.sessions.set(id, info);
    this.notifyListeners(id, "launching");

    try {
      await launchClaudeSession(id, projectPath, info.name, tabColor);
      info.status = "active";
      this.notifyListeners(id, "active");
    } catch (err) {
      info.status = "error";
      this.notifyListeners(id, "error");
      throw err;
    }

    this.ensurePolling();
    return id;
  }

  get(id: string): SessionInfo | undefined {
    return this.sessions.get(id);
  }

  getAll(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  remove(id: string): boolean {
    const deleted = this.sessions.delete(id);
    if (this.sessions.size === 0) {
      this.stopPolling();
    }
    return deleted;
  }

  onStatusChange(
    listener: (id: string, status: SessionStatus) => void
  ): void {
    this.listeners.push(listener);
  }

  private notifyListeners(id: string, status: SessionStatus): void {
    for (const listener of this.listeners) {
      listener(id, status);
    }
  }

  private ensurePolling(): void {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => this.pollStatuses(), 3000);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async pollStatuses(): Promise<void> {
    for (const [id, info] of this.sessions) {
      if (info.status !== "active" && info.status !== "launching") continue;

      try {
        const statusFile = getStatusFilePath(id);
        const content = (await readFile(statusFile, "utf-8")).trim();

        if (content === "DONE" && info.status !== "done") {
          info.status = "done";
          this.notifyListeners(id, "done");
        } else if (content === "ACTIVE" && info.status === "launching") {
          info.status = "active";
          this.notifyListeners(id, "active");
        }
      } catch {
        // Status file not yet written — session still launching
      }
    }
  }
}

export const SessionManager = new SessionManagerService();
