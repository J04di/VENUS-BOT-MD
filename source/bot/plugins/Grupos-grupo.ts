import { database } from "../../core/database.js";
import type { IPlugin } from "../../types/Plugin.js";
import { JidUtils } from "../../utils/JidUtils.js";

export const plugin: IPlugin = {
  name: "grupo",
  description: "Muestra la información del grupo",
  category: "Grupos",
  flags: [],
  fn: async ({ m, bot }) => {
    if (m.from.isPrivate) {
      return;
    }
    const group = (await database.groups.get(m.from.id))!;
    const icon = await bot.ws?.profilePictureUrl(m.from.id, "image");
    const metadata = (await bot.getGroupMetadata(m.from.id))!;
    await bot.sendMessage(m.from.id, {
      image: { url: icon ?? "https://i.pinimg.com/736x/c6/09/0d/c6090df18193e2616a6a32076883b70c.jpg" },
      caption: `🟢 *Grupo:* \`\`\`${metadata.subject.trim()}\`\`\`
🔹 *Participantes:* \`\`\`${(metadata.size ?? metadata.participants.length).toLocaleString()}\`\`\`
🔹 *Dueño:* \`\`\`@${metadata.owner ? new JidUtils(metadata.owner).getNumber() : "Desconocido"}\`\`\`
🔹 *Bot principal:* \`\`\`@${new JidUtils(group.mainBot.lid).getNumber()}\`\`\`
🔹 *Administradores:* \`\`\`${metadata.participants.filter((v) => (v.admin === "admin")).length}\`\`\`
🔹 *Anti-enlaces:* \`\`\`${group.antiLinksOn ? "Activado" : "Desactivado"}\`\`\`
🔹 *Solo administradores:* \`\`\`${group.onlyAdminsOn ? "Activado" : "Desactivado"}\`\`\`
🔹 *Identificador:* \`\`\`${new JidUtils(m.from.id).getNumber()}\`\`\`
🔹 *Modo de direccionamiento*: \`\`\`${m.from.addressingMode}\`\`\``,
      mentions: (metadata.owner ? [metadata.owner] : []).concat(group.mainBot.lid),
    }, { quoted: m.original });
  },
};
