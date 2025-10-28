import type { AuthenticationState, WAMessage } from "baileys";
import type { Readable } from "node:stream";

export interface IBotAuth {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  removeCreds: () => Promise<void>;
}
export interface IBotMeOwner {
  lid: string;
  pn: string;
}
export interface IBotMe {
  lid: string;
  pn: string;
  owner: IBotMeOwner;
}
export type BotConnectionMethod = "qr" | "otp";
export type BotConnectionStatus = "open" | "close" | "loggedout" | "reconnecting";
export interface IBotEventMap {
  "bot:open": [me: IBotMe];
  "bot:close": [reason: string];
  "bot:error": [error: Error];
  "bot:loggedout": [reason: string];
  "bot:qr": [qr: string];
  "bot:otp": [otp: string];
}
