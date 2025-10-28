import type { GroupMetadata, WAMessage } from "baileys";
import type { Bot } from "../bot/Bot.js";

export const caches = {
  groupMetadatas: new Map<string, GroupMetadata>(),
  groupInviteCodes: new Map<string, string>(),
  bots: new Map<string, Bot>(),
  messages: new Map<string, WAMessage>(),
};
