import type { Bot } from "../bot/Bot.js";
import type { ISerializedMessage } from "./SerializedMessage.js";

export interface IPluginContext {
  m: ISerializedMessage;
  bot: Bot;
  prefixUsed: string;
  commandName: string;
  pluginUsed: IPlugin;
  args: string[];
}
export interface IPlugin {
  name: string;
  description: string;
  category: string;
  flags: string[];
  fn: (ctx: IPluginContext) => Promise<void>;
}
