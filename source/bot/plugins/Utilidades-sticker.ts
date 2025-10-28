import { downloadMediaMessage } from "baileys";
import type { IPlugin } from "../../types/Plugin.js";
import { convertToWhatsAppSticker } from "../../utils/convertToWhatsAppSticker.js";
import { randomId } from "../../utils/helpers.js";
import { database } from "../../core/database.js";

export const plugin: IPlugin = {
  name: "sticker",
  description: "Convierte imágenes, videos o gifs a stickers",
  category: "Utilidades",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const { message, original } = m.message.quoted ?? m;
    const { mimetype, hash } = message;
    if (!/^(image\/(jpe?g|png|gif|webp)|video\/mp4)$/.test(mimetype)) {
      await bot.sendMessage(m.from.id, {
        text: `🟡 El mensaje de tipo '${mimetype}' no es compatible.`,
      }, { quoted: original });
      return;
    }
    const me = (await database.bots.get(bot.me.lid))!;
    const input = await downloadMediaMessage(original, "buffer", {});
    const output = await convertToWhatsAppSticker(input, mimetype, hash ?? randomId(10), m.sender.nickname, me.nickname);
    await bot.sendMessage(m.from.id, {
      sticker: output,
    }, { quoted: m.original });
  },
};
