import type { IPlugin } from "../../types/Plugin.js";

export const plugin: IPlugin = {
  name: "velocidad",
  description: "Calcula la velocidad de respuesta del bot",
  category: "Utilidades",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const before = Date.now();
    const message = await bot.sendMessage(m.from.id, {
      text: "🟢 ¡Calculando velocidad!",
    }, { quoted: m.original });
    if (!message) {
      return;
    }
    const now = Date.now();
    const ms = now - before;
    await bot.sendMessage(m.from.id, {
      edit: message.key,
      text: `🟢 *Velocidad:* \`\`\`${ms} milisegundos\`\`\``,
    }, { quoted: m.original });
  },
};
