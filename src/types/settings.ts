export type LaunchSettings = {
  projectPath: string;
  sessionName: string;
  tabColor: string;
};

export type TileSettings = {
  sessionId: string;
};

export type KillSettings = {
  sessionId: string;
};

export type GlobalSettings = {
  defaultTabColor: string;
  terminalProfile: string;
  pollIntervalMs: number;
};

export type SessionStatus = "idle" | "launching" | "active" | "done" | "error";

export type SessionInfo = {
  id: string;
  name: string;
  projectPath: string;
  tabColor: string;
  status: SessionStatus;
  startedAt: Date;
  pid?: number;
};
