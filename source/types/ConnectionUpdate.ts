import type { ConnectionState } from "baileys";
import type { BotConnectionMethod } from "./Bot.js";
import type { Bot } from "../bot/Bot.js";

export interface IConnectionUpdateContext extends Partial<ConnectionState> {
  method: BotConnectionMethod;
  bot: Bot;
}
