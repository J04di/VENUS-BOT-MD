import makeWASocket, { useMultiFileAuthState, type AnyMessageContent, type GroupMetadata, type MiscMessageGenerationOptions, type ParticipantAction, type WAMessage, type WASocket } from "baileys";
import Logger from "@imjxsx/logger";
import { Boom } from "@hapi/boom";
import EventEmitter from "node:events";
import fs from "node:fs";
import path from "node:path";
import type { BotConnectionMethod, BotConnectionStatus, IBotAuth, IBotEventMap, IBotMe } from "../types/Bot.js";
import { connectionUpdate } from "./handlers/connectionUpdate.js";
import { messageUpsert } from "./handlers/messageUpsert.js";
import { InvalidLength } from "../utils/errors.js";
import { caches } from "../core/caches.js";
import { isArray, isBoom, isError, isString, toString } from "../utils/helpers.js";
import { logger } from "../core/logger.js";
import { paths } from "../core/paths.js";

export class Bot extends EventEmitter<IBotEventMap> {
  public auth: Nullable<IBotAuth> = null;
  public connectionTimeout: Nullable<NodeJS.Timeout> = null;
  public readonly id: string;
  public me: IBotMe;
  public connectionStatus: BotConnectionStatus = "close";
  public ws: Nullable<WASocket> = null;
  public logger: Logger;
  constructor(id: string, me: IBotMe) {
    super();
    if (10 > id.length) {
      throw new InvalidLength("The bot ID must have at least 10 digits.");
    }
    this.id = id;
    this.me = me;
    this.logger = logger.child({
      name: `Bot ${this.id}`,
    });
  }
  public async connect(method: BotConnectionMethod): Promise<void> {
    try {
      if (!this.auth) {
        this.auth = {
          ...(await useMultiFileAuthState(path.join(paths.sessions, this.id))),
          removeCreds: async (): Promise<void> => {
            await fs.promises.rm(path.join(paths.sessions, this.id), {
              recursive: true,
              force: true,
            });
          },
        };
      }
      this.ws = makeWASocket({
        auth: this.auth.state,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Firefox", "24.04.3"],
        logger: new Logger({ level: "OFF" }),
        generateHighQualityLinkPreview: false,
        linkPreviewImageThumbnailWidth: 192,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => {
          return false;
        },
        shouldIgnoreJid: (jid) => {
          return !/@(lid|s\.whatsapp\.net|g\.us)$/i.test(jid);
        },
        qrTimeout: 60_000,
        version: [2, 3_000, 1_027_934_701],
        cachedGroupMetadata: async (jid) => {
          return caches.groupMetadatas.get(jid);
        },
      });
      this.ws.ev.on("creds.update", async () => {
        try {
          await this.auth?.saveCreds();
        } catch (e) {
          const err = isError(e) ? e : new Error(String(e));
          this.logger.error(err);
        }
      });
      this.ws.ev.on("connection.update", async (ctx) => {
        try {
          await connectionUpdate({
            ...ctx,
            method,
            bot: this,
          });
        } catch (e) {
          const err = isError(e) ? e : new Error(String(e));
          this.logger.error(err);
        }
      });
      this.ws.ev.on("messages.upsert", async (ctx) => {
        try {
          await messageUpsert({
            ...ctx,
            bot: this,
          });
        } catch (e) {
          const err = isError(e) ? e : new Error(String(e));
          this.logger.error(err);
        }
      });
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
    }
  }
  public async disconnect(reason?: Optional<Boom>): Promise<void> {
    try {
      reason = isBoom(reason) ? reason : new Boom("Intentional disconnection", { statusCode: 204 });
      this.ws?.end(reason);
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
    }
  }
  public async logout(reason?: Optional<string>): Promise<void> {
    try {
      await this.ws?.logout(reason);
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
    }
  }
  public parseMentions(text: string, server: Optional<"lid" | "s.whatsapp.net"> = "lid"): string[] {
    text = isString(text) ? text : toString(text);
    server = /^(lid|s\.whatsapp\.net)$/.test(server) ? server : "lid";
    const jids = new Set<string>();
    for (const jid of text.matchAll(/@([0-9]{7,15}|0)/g)) {
      jids.add(`${jid}@${server}`);
    }
    return jids.values().toArray();
  }
  public async sendText(from: string, text: string, quoted?: Optional<WAMessage>, mentions?: Optional<string[]>): Promise<Nullable<WAMessage>> {
    text = isString(text) ? text : toString(text);
    mentions = isArray(mentions) ? mentions : [];
    const message = await this.ws?.sendMessage(from, {
      text,
      mentions: mentions.concat(this.parseMentions(text)),
    }, {
      quoted,
    });
    return message ?? null;
  }
  public async sendMessage(from: string, content: AnyMessageContent, options?: Optional<MiscMessageGenerationOptions>): Promise<Nullable<WAMessage>> {
    try {
      const message = await this.ws?.sendMessage(from, content, options);
      return message ?? null;
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
      return null;
    }
  }
  public async getGroupMetadata(id: string, fromCache?: Optional<boolean>): Promise<Nullable<GroupMetadata>> {
    try {
      let metadata = fromCache ? caches.groupMetadatas.get(id) : null;
      if (!metadata) {
        metadata = await this.ws?.groupMetadata(id);
        if (metadata) {
          caches.groupMetadatas.set(id, metadata);
        }
      }
      return metadata ?? null;
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
      return null;
    }
  }
  public async getGroupInviteCode(id: string, fromCache?: Optional<boolean>): Promise<Nullable<string>> {
    try {
      let code = fromCache ? caches.groupInviteCodes.get(id) : null;
      if (!code) {
        code = await this.ws?.groupInviteCode(id);
        if (code) {
          caches.groupInviteCodes.set(id, code);
        }
      }
      return code ?? null;
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
      return null;
    }
  }
  public async updateGroupParticipants(id: string, participants: string[], action: ParticipantAction): Promise<[string, number][]> {
    try {
      if (!this.ws) {
        return [];
      }
      const results: [string, number][] = [];
      (await this.ws.groupParticipantsUpdate(id, participants, action)).forEach((v) => {
        if (!v.jid) {
          return;
        }
        results.push([v.jid, Number(v.status)]);
      });
      return results;
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
      return [];
    }
  }
}
