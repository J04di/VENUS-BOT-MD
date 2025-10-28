import { http } from "../../core/http.js";
import type { IPlugin } from "../../types/Plugin.js";

export const plugin: IPlugin = {
  name: "tiktok",
  description: "Descarga videos o imágenes de TikTok",
  category: "Descargas",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const links = m.message.links.filter((v) => (/(www|vt|vm)\.tiktok\.com/.test(new URL(v).hostname)));
    if (!links.length) {
      await bot.sendMessage(m.from.id, {
        text: "🟡 No se detectó ningún enlace de TikTok válido en el mensaje.",
      }, { quoted: m.original });
      return;
    }
    for (const link of links) {
      const { data } = await http.get("https://www.tikwm.com/api", {
        params: {
          url: link,
        },
      }).catch(() => ({ data: null }));
      if (!data?.data?.play && !data?.data?.images?.length) {
        await bot.sendMessage(m.from.id, {
          text: `🟡 No se pudo obtener la información del enlace '${link}'`,
        }, { quoted: m.original });
        continue;
      }
      const { play, images, title, size, play_count, digg_count, comment_count, share_count, download_count, author } = data.data;
      const text = `🟢 *Título:* \`\`\`${(title ?? "Video").trim()}\`\`\`
🔹 *Autor:* \`\`\`${(author?.nickname ?? "@tiktok").trim()}\`\`\`
🔹 *Tamaño:* \`\`\`${((size ?? 0) / 1_048_576).toFixed(2)}MB\`\`\`
🔹 *Reproducciones:* \`\`\`${(play_count ?? 0).toLocaleString()}\`\`\`
🔹 *Me gustas:* \`\`\`${(digg_count ?? 0).toLocaleString()}\`\`\`
🔹 *Comentarios:* \`\`\`${(comment_count ?? 0).toLocaleString()}\`\`\`
🔹 *Compartidos:* \`\`\`${(share_count ?? 0).toLocaleString()}\`\`\`
🔹 *Descargas:* \`\`\`${(download_count ?? 0).toLocaleString()}\`\`\`
🔹 *Enlace:* \`\`\`${link}\`\`\``;
      if (images?.length) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (i === 0) {
            await bot.sendMessage(m.from.id, {
              image: { url: image },
              caption: text,
            }, { quoted: m.original });
          }
          else {
            await bot.sendMessage(m.from.id, {
              image: { url: image },
            }, { quoted: m.original });
          }
        }
      }
      else {
        await bot.sendMessage(m.from.id, {
          video: { url: play },
          caption: text,
        }, { quoted: m.original });
      }
    }
  },
};
