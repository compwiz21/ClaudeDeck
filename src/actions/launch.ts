import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import type { LaunchSettings } from "../types/settings";
import { SessionManager } from "../services/session-manager";
import { generateLaunchSvg } from "../services/svg-generator";

@action({ UUID: "com.claudedeck.plugin.launch" })
export class LaunchAction extends SingletonAction<LaunchSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<LaunchSettings>
  ): Promise<void> {
    await ev.action.setImage(generateLaunchSvg());
  }

  override async onKeyDown(
    ev: KeyDownEvent<LaunchSettings>
  ): Promise<void> {
    const {
      projectPath = "",
      sessionName = "Claude",
      tabColor = "#6B4FBB",
    } = ev.payload.settings;

    if (!projectPath) {
      streamDeck.logger.warn("Launch: no project path configured");
      await ev.action.showAlert();
      return;
    }

    try {
      await ev.action.setTitle("...");
      const sessionId = await SessionManager.launch(
        projectPath,
        sessionName,
        tabColor
      );
      streamDeck.logger.info(
        `Launched session ${sessionId}: ${sessionName} at ${projectPath}`
      );
      await ev.action.showOk();
      await ev.action.setTitle("Launch");
    } catch (err) {
      streamDeck.logger.error(`Launch failed: ${err}`);
      await ev.action.showAlert();
      await ev.action.setTitle("Error");

      // Reset title after a delay
      setTimeout(() => ev.action.setTitle("Launch"), 3000);
    }
  }
}
