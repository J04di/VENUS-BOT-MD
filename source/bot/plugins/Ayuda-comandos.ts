import { app } from "../../core/app.js";
import { database } from "../../core/database.js";
import { plugins } from "../../core/plugins.js";
import type { IPlugin } from "../../types/Plugin.js";

export const plugin: IPlugin = {
  name: "comandos",
  description: "Muestra la lista de comandos del bot",
  category: "Ayuda",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const user = (await database.users.get(m.sender.lid))!;
    const me = (await database.bots.get(bot.me.lid))!;
    const categoryzed: Record<string, IPlugin[]> = {};
    plugins.getAll().forEach((v) => {
      if (!(v.category in categoryzed)) {
        categoryzed[v.category] = [];
      }
      categoryzed[v.category]!.push(v);
    });
    let text = `👋 !Hola *${m.sender.nickname}*!, soy *${me.nickname}* ❤`;
    text += "\n";
    text += `🔹 *Versión:* \`\`\`${app.version}\`\`\``;
    text += "\n";
    text += `🔹 *Identificador:* \`\`\`${bot.id}\`\`\``;
    text += "\n";
    text += `🔹 *Desarrollado por:* \`\`\`Zyphra Studios\`\`\``
    text += "\n\n";
    text += `🧩 *Mis Complementos* \`\`\`${plugins.size}\`\`\` 🧩`;
    text += "\n";
    for (const [category, plugins] of Object.entries(categoryzed)) {
      text += `🏷 *${category}* \`\`\`${plugins.length}\`\`\``;
      text += "\n";
      for (const plugin of plugins) {
        text += `▫ *${plugin.name}*`;
        text += "\n";
        text += `> _${plugin.description}_`;
        text += "\n";
      }
      text += "\n";
    };
    await bot.sendMessage(m.from.id, {
      image: { url: "https://i.pinimg.com/736x/6a/d3/03/6ad303edbdcda280275cd0d772a8591b.jpg" },
      caption: text,
    }, { quoted: m.original });
  },
};
