import { exec } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const STATUS_DIR = join(tmpdir(), "claudedeck");
const WINDOW_NAME = "claudedeck";

export async function ensureStatusDir(): Promise<void> {
  await mkdir(STATUS_DIR, { recursive: true });
}

export function getStatusFilePath(sessionId: string): string {
  return join(STATUS_DIR, `${sessionId}.status`);
}

export function getWrapperScriptPath(sessionId: string): string {
  return join(STATUS_DIR, `${sessionId}.cmd`);
}

export async function launchClaudeSession(
  sessionId: string,
  projectPath: string,
  title: string,
  tabColor: string
): Promise<void> {
  await ensureStatusDir();

  // Write a wrapper script that tracks when claude exits
  const statusFile = getStatusFilePath(sessionId);
  const wrapperPath = getWrapperScriptPath(sessionId);

  const wrapperScript = `@echo off
echo ACTIVE > "${statusFile}"
claude
echo DONE > "${statusFile}"
`;

  await writeFile(wrapperPath, wrapperScript);

  // Build the Windows Terminal command
  const args = [
    "-w", WINDOW_NAME,
    "new-tab",
    "--title", `"${title}"`,
    "--suppressApplicationTitle",
    "--tabColor", `"${tabColor}"`,
    "-d", `"${projectPath}"`,
    `"${wrapperPath}"`,
  ];

  const cmd = `wt.exe ${args.join(" ")}`;

  return new Promise((resolve, reject) => {
    exec(cmd, { shell: true }, (error) => {
      if (error) {
        reject(new Error(`Failed to launch terminal: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
}

export function focusTerminalWindow(): void {
  // Focus the named Windows Terminal window
  exec(`wt.exe -w ${WINDOW_NAME} focus-tab`, { shell: true });
}
