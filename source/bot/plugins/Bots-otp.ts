import type { IPlugin } from "../../types/Plugin.js";
import { randomId } from "../../utils/helpers.js";
import { JidUtils } from "../../utils/JidUtils.js";
import { Bot } from "../Bot.js";

export const plugin: IPlugin = {
  name: "otp",
  description: "Genera un código OTP de 8 dígitos para que puedas vincular un bot a tu número",
  category: "Bots",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const id = randomId(10);
    const subbot = new Bot(id, {
      lid: m.sender.lid,
      pn: m.sender.pn,
      owner: {
        lid: m.sender.lid,
        pn: m.sender.lid,
      },
    });
    subbot.on("bot:otp", async (otp) => {
      await bot.sendMessage((m.from as any).id, {
        text: `🟢 *Código OTP:* \`\`\`${otp.replace(/(\w{4})(\w{4})/, "$1-$2")}\`\`\``,
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
    await subbot.connect("otp");
  },
};
