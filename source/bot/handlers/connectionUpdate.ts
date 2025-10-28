import { isLidUser, isPnUser, jidNormalizedUser } from "baileys";
import type { IConnectionUpdateContext } from "../../types/ConnectionUpdate.js";
import { Boom } from "@hapi/boom";
import { JidUtils } from "../../utils/JidUtils.js";
import { database } from "../../core/database.js";
import { delay } from "../../utils/helpers.js";
import { caches } from "../../core/caches.js";

export async function connectionUpdate(ctx: IConnectionUpdateContext): Promise<void> {
  const { qr, lastDisconnect, connection, method, bot } = ctx;
  if (!bot.ws) {
    return;
  }
  if (qr) {
    if (method === "qr") {
      bot.emit("bot:qr", qr);
    }
    else if (method === "otp") {
      if (!isPnUser(bot.me.pn)) {
        await bot.disconnect(new Boom("Invalid phone number for registration by OTP code", { statusCode: 400 }));
        return;
      }
      const jid = new JidUtils(bot.me.pn).getNumber();
      const otp = await bot.ws.requestPairingCode(`${jid}`);
      bot.emit("bot:otp", otp);
    }
  }
  if (connection === "close") {
    (bot.ws.ev as any).removeAllListeners();
    const { output } = new Boom(lastDisconnect?.error);
    switch (output.statusCode) {
      case 522:
      case 500:
      case 440:
      //case 408:
      case 405:
      case 403:
      case 401:
      case 400: {
        await Promise.all([
          bot.auth?.removeCreds(),
          database.bots.del(bot.me.lid),
        ]);
        bot.emit("bot:loggedout", `[${output.statusCode} ${output.payload.error}] ${output.payload.message}`);
        bot.connectionStatus = "loggedout";
        bot.auth = null;
        break;
      }
      case 515: {
        await bot.connect(method);
        break;
      }
      default: {
        bot.emit("bot:close", `[${output.statusCode} ${output.payload.error}] ${output.payload.message}`);
        if (output.statusCode === 503) {
          await delay(30_000);
        }
        else if (output.statusCode === 204) {
          bot.connectionStatus = "close";
          break;
        }
        bot.connectionStatus = "reconnecting";
        await bot.connect(method);
        break;
      }
    }
    return;
  }
  else if (connection === "open") {
    bot.me.lid = jidNormalizedUser(bot.ws.user?.lid);
    bot.me.pn = jidNormalizedUser(bot.ws.user?.id);
    if (!isLidUser(bot.me.lid)) {
      await bot.disconnect(new Boom("Reconnection required", { statusCode: 515 }));
      return;
    }
    if (caches.bots.has(bot.me.lid)) {
      await bot.logout(`There is already a bot linked to the phone number '@${new JidUtils(bot.me.lid).getNumber()}'`);
      return;
    }
    if (bot.connectionStatus !== "reconnecting") {
      bot.emit("bot:open", bot.me);
    }
    bot.connectionStatus = "open";
    caches.bots.set(bot.me.lid, bot);
    return;
  }
  if (bot.connectionTimeout) {
    return;
  }
  bot.connectionTimeout = setTimeout(async () => {
    if (bot.connectionStatus !== "open") {
      await bot.disconnect(new Boom("The connection timeout has occurred.", { statusCode: 522 }));
    }
  }, 60_000);
}
