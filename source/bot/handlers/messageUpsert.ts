import { app } from "../../core/app.js";
import { caches } from "../../core/caches.js";
import { database } from "../../core/database.js";
import { plugins } from "../../core/plugins.js";
import type { IMessageUpsertContext } from "../../types/MessageUpsert.js";
import { isError } from "../../utils/helpers.js";
import { serializeMessage } from "../../utils/serializeMessage.js";
import { antiLink } from "../middlewares/antiLink.js";

export async function messageUpsert(ctx: IMessageUpsertContext): Promise<void> {
  const { messages, bot, type } = ctx;
  if (type !== "notify" || !messages.length || !bot.ws) {
    return;
  }
  for (const message of messages) {
    if (!message.message) {
      continue;
    }
    const m = serializeMessage(message, ctx.bot);
    if (!m || m.from.isPrivate || m.from.addressingMode !== "lid") {
      continue;
    }
    if (!(await database.users.has(m.sender.lid))) {
      const success = await database.users.set(m.sender.lid, {
        lid: m.sender.lid,
        pn: m.sender.pn,
        nickname: m.sender.nickname,
        isBanned: false,
        money: 0,
      });
      if (!success) {
        continue;
      }
    }
    else {
      const user = (await database.users.get(m.sender.lid))!;
      if (m.sender.nickname !== user.nickname) {
        await database.users.update(m.sender.lid, {
          nickname: m.sender.nickname,
        });
      }
      if (user.isBanned) {
        continue;
      }
    }
    if (!(await database.groups.has(m.from.id))) {
      const success = await database.groups.set(m.from.id, {
        id: m.from.id,
        antiLinksOn: true,
        onlyAdminsOn: false,
        mainBot: {
          lid: bot.me.lid,
          pn: bot.me.pn
        },
      });
      if (!success) {
        continue;
      }
    }
    else {
      const group = (await database.groups.get(m.from.id))!;
      if (!caches.bots.has(group.mainBot.lid)) {
        await database.groups.update(m.from.id, {
          mainBot: {
            lid: bot.me.lid,
            pn: bot.me.pn,
          },
        });
      }
      else if (bot.me.lid !== group.mainBot.lid) {
        continue;
      }
    }
    if (!(await database.bots.has(bot.me.lid))) {
      const success = await database.bots.set(bot.me.lid, {
        lid: bot.me.lid,
        pn: bot.me.pn,
        nickname: app.name,
        id: bot.id,
        owner: bot.me.owner,
      });
      if (!success) {
        continue;
      }
    }
    if (await antiLink({ m, bot })) {
      continue;
    }
    if (!/[/]/.test(m.message.text)) {
      continue;
    }
    const divided = m.message.text.split(/\s+/).filter(Boolean);
    const prefixUsed = divided[0]?.charAt(0) ?? "";
    const commandName = divided[0]?.slice(1).toLowerCase() ?? "";
    const args = divided.slice(1);
    const pluginUsed = plugins.get(commandName);
    if (!pluginUsed) {
      await bot.ws.sendMessage(m.from.id, {
        text: `🟡 El comando *${prefixUsed + commandName}* no es válido, usa el comando *${prefixUsed}comandos* para recibir ayuda.`,
      }, { quoted: m.original });
      continue;
    }
    try {
      await pluginUsed.fn({
        m,
        bot, prefixUsed,
        commandName,
        pluginUsed,
        args,
      });
    }
    catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      await bot.ws.sendMessage(m.from.id, {
        text: `🛑 *${err.name}:* \`\`\`${err.message}\`\`\``,
      }, { quoted: m.original });
    }
  }
}
