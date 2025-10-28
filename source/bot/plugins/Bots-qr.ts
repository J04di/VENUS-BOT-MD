import QRCode from "qrcode";
import type { IPlugin } from "../../types/Plugin.js";
import { randomId } from "../../utils/helpers.js";
import { Bot } from "../Bot.js";
import { JidUtils } from "../../utils/JidUtils.js";

export const plugin: IPlugin = {
  name: "qr",
  description: "Genera un código QR para que puedas vincular un bot a tu número",
  category: "Bots",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const id = randomId(10);
    const subbot = new Bot(id, {
      lid: "",
      pn: "",
      owner: {
        lid: m.sender.lid,
        pn: m.sender.lid,
      },
    });
    subbot.on("bot:qr", async (qr) => {
      await bot.sendMessage((m.from as any).id, {
        image: await QRCode.toBuffer(qr, { scale: 8 }),
        caption: `🟢 Escanea este código QR para vinvular el bot a tu número.`,
      }, { quoted: m.original });
    });
    subbot.on("bot:error", async (err) => {
      await bot.sendMessage((m.from as any).id, {
        text: `🛑 *${err.name}:* \`\`\`${err.message}\`\`\``,
        mentions: bot.parseMentions(err.message),
      }, { quoted: m.original });
    });
    subbot.on("bot:close", async (reason) => {
      await bot.sendMessage((m.from as any).id, {
        text: `🟡 ${reason}`,
        mentions: bot.parseMentions(reason),
      }, { quoted: m.original });
    });
    subbot.on("bot:loggedout", async (reason) => {
      await bot.sendMessage((m.from as any).id, {
        text: `🔴 ${reason}`,
        mentions: bot.parseMentions(reason),
      }, { quoted: m.original });
    });
    subbot.on("bot:open", async (me) => {
      const text = `🟢 '@${new JidUtils(me.owner.lid).getNumber()}' vinculaste con éxito un bot en '@${new JidUtils(me.lid).getNumber()}'`;
      await bot.sendMessage((m.from as any).id, {
        text,
        mentions: bot.parseMentions(text),
      }, { quoted: m.original });
    });
    await subbot.connect("qr");
  },
};
