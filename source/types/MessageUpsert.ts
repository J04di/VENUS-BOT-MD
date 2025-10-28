import type { MessageUpsertType, WAMessage } from "baileys";
import type { Bot } from "../bot/Bot.js";

export interface BaileysMessageUpsert {
  messages: WAMessage[];
  type: MessageUpsertType;
  requestId?: string;
}
export interface IMessageUpsertContext extends BaileysMessageUpsert {
  bot: Bot;
}
