import { database } from "../../core/database.js";
import type { IAntiLinkContext } from "../../types/AntiLink.js";
import { JidUtils } from "../../utils/JidUtils.js";

const WHATSAPP_LINK_REGEX = /(?:https?:\/\/)?(?:(?:www|chat)\.)?whatsapp\.com\/(?:(?:invite|channel)\/)?([A-Za-z0-9]{20,})/i;
export async function antiLink(ctx: IAntiLinkContext): Promise<boolean> {
  const { m, bot } = ctx;
  if (m.from.isPrivate || !m.message.links.length || !bot.ws) {
    return false;
  }
  const group = await database.groups.get(m.from.id);
  const metadata = await bot.getGroupMetadata(m.from.id);
  if (!group?.antiLinksOn || !metadata) {
    return false;
  }
  const admins = metadata.participants.filter((v) => (!!v.admin)).map((v) => (v.id));
  const isUserAdmin = admins.some((v) => (m.sender.lid === v));
  const isBotAdmin = admins.some((v) => (bot.me.lid === v));
  if (!isBotAdmin || isUserAdmin) {
    return false;
  }
  const code = await bot.getGroupInviteCode(m.from.id) ?? "";
  let result = false;
  for (const link of m.message.links) {
    const match = link.match(WHATSAPP_LINK_REGEX)?.[1];
    if (!match || match === code) {
      continue;
    }
    const [_, status] = (await bot.updateGroupParticipants(m.from.id, [m.sender.lid], "remove"))[0] ?? [];
    if (status !== 200) {
      await bot.sendMessage(m.from.id, {
        text: `🟡 El participante @${new JidUtils(m.sender.lid).getNumber()} envió un enlace de WhatsApp.
🔹 *Enlace detectado:* \`\`\`${link}\`\`\``,
        mentions: admins.concat(m.sender.lid),
      }, { quoted: m.original });
      continue;
    }
    await bot.sendMessage(m.from.id, {
      text: `🟢 El participante @${new JidUtils(m.sender.lid).getNumber()} fue eliminado del grupo por el anti-enlaces.
🔹 *Enlace detectado:* \`\`\`${link}\`\`\``,
      mentions: admins.concat(m.sender.lid),
    }, { quoted: m.original });
    await bot.sendMessage(m.from.id, {
      delete: m.original.key,
    });
    result = true;
    break;
  }
  return result;
}
