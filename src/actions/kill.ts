import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import type { KillSettings } from "../types/settings";
import { SessionManager } from "../services/session-manager";
import { generateKillSvg } from "../services/svg-generator";

@action({ UUID: "com.claudedeck.plugin.kill" })
export class KillAction extends SingletonAction<KillSettings> {
  // Double-press confirmation: track last press time per button
  private lastPress = new Map<string, number>();
  private readonly CONFIRM_WINDOW_MS = 2000;

  override async onWillAppear(
    ev: WillAppearEvent<KillSettings>
  ): Promise<void> {
    await ev.action.setImage(generateKillSvg());
  }

  override async onKeyDown(
    ev: KeyDownEvent<KillSettings>
  ): Promise<void> {
    const { sessionId = "" } = ev.payload.settings;

    if (!sessionId) {
      await ev.action.showAlert();
      return;
    }

    const session = SessionManager.get(sessionId);
    if (!session) {
      streamDeck.logger.warn(`Kill: session ${sessionId} not found`);
      await ev.action.showAlert();
      return;
    }

    const now = Date.now();
    const last = this.lastPress.get(ev.action.id) ?? 0;

    if (now - last > this.CONFIRM_WINDOW_MS) {
      // First press — ask for confirmation
      this.lastPress.set(ev.action.id, now);
      await ev.action.setTitle("Confirm?");
      setTimeout(() => ev.action.setTitle("Kill"), this.CONFIRM_WINDOW_MS);
      return;
    }

    // Second press within window — kill it
    this.lastPress.delete(ev.action.id);

    SessionManager.remove(sessionId);
    streamDeck.logger.info(`Killed session: ${session.name} (${sessionId})`);
    await ev.action.showOk();
    await ev.action.setTitle("Killed");
    setTimeout(() => ev.action.setTitle("Kill"), 2000);
  }
}
