import type { Bot } from "../bot/Bot.js";
import type { ISerializedMessage } from "./SerializedMessage.js";

export interface IAntiLinkContext {
  m: ISerializedMessage;
  bot: Bot;
}
