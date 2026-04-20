import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { TileSettings, SessionStatus } from "../types/settings";
import { SessionManager } from "../services/session-manager";
import { generateSessionSvg } from "../services/svg-generator";
import { focusTerminalWindow } from "../services/terminal-launcher";

@action({ UUID: "com.claudedeck.plugin.tile" })
export class TileAction extends SingletonAction<TileSettings> {
  private visibleTiles = new Map<
    string,
    { actionRef: WillAppearEvent<TileSettings>["action"]; sessionId: string }
  >();

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();

    // Listen for session status changes and update tiles
    SessionManager.onStatusChange((sessionId, status) => {
      this.updateTilesForSession(sessionId, status);
    });
  }

  override async onWillAppear(
    ev: WillAppearEvent<TileSettings>
  ): Promise<void> {
    const { sessionId = "" } = ev.payload.settings;

    this.visibleTiles.set(ev.action.id, {
      actionRef: ev.action,
      sessionId,
    });

    // Show current state
    const session = sessionId ? SessionManager.get(sessionId) : undefined;
    if (session) {
      await ev.action.setImage(
        generateSessionSvg(session.name, session.status, session.tabColor)
      );
    } else {
      await ev.action.setImage(
        generateSessionSvg("No Session", "idle")
      );
    }

    this.ensureRefresh();
  }

  override async onWillDisappear(
    ev: WillDisappearEvent<TileSettings>
  ): Promise<void> {
    this.visibleTiles.delete(ev.action.id);
    if (this.visibleTiles.size === 0 && this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<TileSettings>
  ): Promise<void> {
    const { sessionId = "" } = ev.payload.settings;

    if (!sessionId) {
      await ev.action.showAlert();
      return;
    }

    const session = SessionManager.get(sessionId);
    if (session && session.status === "active") {
      // Focus the Windows Terminal window
      focusTerminalWindow();
      await ev.action.showOk();
    } else {
      await ev.action.showAlert();
    }
  }

  private async updateTilesForSession(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    const session = SessionManager.get(sessionId);
    if (!session) return;

    for (const [, tile] of this.visibleTiles) {
      if (tile.sessionId === sessionId) {
        await tile.actionRef.setImage(
          generateSessionSvg(session.name, status, session.tabColor)
        );
      }
    }
  }

  private ensureRefresh(): void {
    if (this.refreshTimer) return;

    // Periodic refresh to catch any missed status updates
    this.refreshTimer = setInterval(async () => {
      for (const [, tile] of this.visibleTiles) {
        if (!tile.sessionId) continue;
        const session = SessionManager.get(tile.sessionId);
        if (session) {
          await tile.actionRef.setImage(
            generateSessionSvg(session.name, session.status, session.tabColor)
          );
        }
      }
    }, 5000);
  }
}
