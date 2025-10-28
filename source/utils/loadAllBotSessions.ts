import fs from "node:fs";
import path from "node:path";
import { paths } from "../core/paths.js";
import { logger } from "../core/logger.js";
import { Bot } from "../bot/Bot.js";
import QRCode from "qrcode";
import { JidUtils } from "./JidUtils.js";
import { JSONparse } from "./JSON.js";
import { isLidUser, jidNormalizedUser, type AuthenticationCreds } from "baileys";
import { database } from "../core/database.js";
import { caches } from "../core/caches.js";
import { isError } from "./helpers.js";

export async function loadAllBotSessions() {
  try {
    const before = Date.now();
    try {
      await fs.promises.access(paths.sessions);
    } catch {
      await fs.promises.mkdir(paths.sessions, { recursive: true });
      return;
    }
    logger.info(`Loading bot sessions from '${paths.sessions}'`);
    const directories = await fs.promises.readdir(paths.sessions);
    if (!directories.length) {
      logger.info("Initializing a main bot.");
      const main = new Bot("venus-main", {
        lid: process.env["BOT_LID"] ?? "",
        pn: process.env["BOT_PN"] ?? "",
        owner: {
          lid: process.env["OWNER_LID"] ?? "",
          pn: process.env["OWNER_PN"] ?? "",
        },
      });
      main.on("bot:qr", async (qr) => {
        logger.info("Scan this QR code to start a main bot.");
        console.log(await QRCode.toString(qr, {
          small: true,
          type: "terminal",
        }));
      });
      main.on("bot:error", (err) => {
        logger.error(err);
      });
      main.on("bot:otp", (otp) => {
        logger.info("Use this OTP code to start a main bot");
        logger.info(otp);
      });
      main.on("bot:close", (reason) => {
        logger.warn(reason);
      });
      main.on("bot:loggedout", (reason) => {
        logger.warn(reason);
      });
      main.on("bot:open", (me) => {
        logger.info(`Main bot successfully connected on '@${new JidUtils(me.pn).getNumber()}'`);
      });
      await main.connect(process.env["CONNECTION_METHOD"] === "otp" ? "otp" : "qr");
      return;
    }
    for (const directory of directories) {
      logger.trace(`Loading session with id '${directory}'`);
      const sessionPath = path.join(paths.sessions, directory);
      try {
        logger.trace(`Checking if session with id '${directory}' has saved credentials.`);
        await fs.promises.access(path.join(sessionPath, "creds.json"));
      } catch {
        logger.debug(`Session with id '${directory}' has no saved credentials.`);
        await fs.promises.rm(sessionPath, {
          recursive: true,
          force: true,
        });
        continue;
      }
      logger.trace(`Reading session credentials with id '${directory}'`);
      const raw = await fs.promises.readFile(path.join(sessionPath, "creds.json"), "utf8");
      const creds = JSONparse<AuthenticationCreds>(raw);
      if (!creds?.me?.lid || !isLidUser(creds.me.lid)) {
        logger.debug(`The session with id '${directory}' does not have valid credentials.`);
        await fs.promises.rm(sessionPath, {
          recursive: true,
          force: true,
        });
        continue;
      }
      const lid = jidNormalizedUser(creds.me.lid);
      const pn = jidNormalizedUser(creds.me.id);
      const me = await database.bots.get(lid);
      if (!me) {
        logger.debug(`Session with id '${directory}' is not registered in the database.`);
        await fs.promises.rm(sessionPath, {
          recursive: true,
          force: true,
        });
        continue;
      }
      const bot = new Bot(me.id, {
        lid,
        pn,
        owner: me.owner,
      });
      bot.on("bot:open", () => {
        logger.trace(`The session with id '${me.id}' has been loaded successfully.`);
      });
      bot.on("bot:qr", async () => {
        await bot.logout();
        await fs.promises.rm(sessionPath, {
          recursive: true,
          force: true,
        });
      });
      await bot.connect("qr");
    }
    const now = Date.now();
    const ms = now - before;
    logger.info(`${caches.bots.size} bot sessions successfully loaded in ${ms} ms.`);
  } catch (e) {
    const err = isError(e) ? e : new Error(String(e));
    logger.error(err);
  }
}
