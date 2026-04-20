import streamDeck from "@elgato/streamdeck";
import { LaunchAction } from "./actions/launch";
import { TileAction } from "./actions/tile";
import { KillAction } from "./actions/kill";

// Register all actions
streamDeck.actions.registerAction(new LaunchAction());
streamDeck.actions.registerAction(new TileAction());
streamDeck.actions.registerAction(new KillAction());

// Connect to Stream Deck
streamDeck.connect();
