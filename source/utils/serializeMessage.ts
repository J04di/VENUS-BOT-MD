import type { proto, WAMessage } from "baileys";
import type { IMessageContent, ISerializedMessage } from "../types/SerializedMessage.js";
import type { Bot } from "../bot/Bot.js";
import { isLink, isNumber, isString, ObjectKeys } from "./helpers.js";
import Long from "long";

export function serializeMessage(message: WAMessage, bot: Bot): Nullable<ISerializedMessage> {
  if (!message.message || !bot.ws) {
    return null;
  }
  const remoteJid = message.key.remoteJid ?? "";
  const remoteJidAlt = message.key.remoteJidAlt ?? "";
  const participant = message.key.participant ?? "";
  const participantAlt = message.key.participantAlt ?? "";
  const serialized = <ISerializedMessage>{};
  if (/@g\.us$/.test(remoteJid)) {
    serialized.from = {
      id: remoteJid,
      isGroup: true,
      isPrivate: false,
      addressingMode: /^lid$/.test(message.key.addressingMode ?? "") ? "lid" : "pn",
    };
  }
  else if (/@(s\.whatsapp\.net|lid)$/.test(remoteJid)) {
    serialized.from = {
      lid: /@lid$/.test(remoteJid) ? remoteJid : /@lid$/.test(remoteJidAlt) ? remoteJidAlt : "",
      pn: /@s\.whatsapp\.net$/.test(remoteJid) ? remoteJid : /@s\.whatsapp\.net$/.test(remoteJidAlt) ? remoteJidAlt : "",
      isPrivate: true,
      isGroup: false,
    };
  }
  serialized.fromMe = message.key.fromMe ?? false;
  if (/@(s\.whatsapp\.net|lid)$/.test(participant)) {
    serialized.sender = {
      lid: message.key.fromMe ? bot.me.lid : /@lid$/.test(participant) ? participant : /@lid$/.test(participantAlt) ? participantAlt : "",
      pn: message.key.fromMe ? bot.me.pn : /@s\.whatsapp\.net$/.test(participant) ? participant : /@s\.whatsapp\.net$/.test(participantAlt) ? participantAlt : "",
      nickname: message.pushName ?? message.verifiedBizName ?? "",
    };
  }
  else if (serialized.from.isPrivate) {
    serialized.sender = {
      lid: message.key.fromMe ? bot.me.lid : serialized.from.lid,
      pn: message.key.fromMe ? bot.me.pn : serialized.from.pn,
      nickname: message.pushName ?? message.verifiedBizName ?? "",
    };
  }
  const content = extractMessageContent(message.message, bot);
  if (!content) {
    return null;
  }
  serialized.message = content;
  serialized.original = message;
  return serialized;
}
function extractMessageContent(message: proto.IMessage, bot: Bot): Nullable<IMessageContent> {
  if (!ObjectKeys(message).length) {
    return null;
  }
  delete message.senderKeyDistributionMessage;
  delete message.messageContextInfo;
  const type = ObjectKeys(message)[0];
  if (!type || !message[type]) {
    return null;
  }
  const content = <IMessageContent>{};
  let m = message[type];
  const info = !isString(m) && "contextInfo" in m ? m.contextInfo : null;
  content.type = type;
  switch (type) {
    case "conversation":
    case "extendedTextMessage": {
      let m = message[type];
      content.text = (isString(m) ? m : m.text ?? "").trim();
      content.mimetype = "text/plain";
      content.mentioned = [];
      content.size = (isString(m) ? m : m.text ?? "").trim().length;
      break;
    }
    case "viewOnceMessage":
    case "viewOnceMessageV2":
    case "viewOnceMessageV2Extension":
    case "documentWithCaptionMessage": {
      message = message[type].message ?? {};
      return extractMessageContent(message, bot);
    }
    default: {
      let m = message[type];
      content.text = (("caption" in m ? m.caption : null) ?? "").trim();
      content.mimetype = ("mimetype" in m ? m.mimetype : null) ?? "application/octet-stream";
      content.mentioned = info?.mentionedJid ?? [];
      content.size = ("fileLength" in m ? m.fileLength ? isNumber(m.fileLength) ? m.fileLength : Long.fromValue(m.fileLength).toNumber() : null : null) ?? 0;
      content.hash = "fileSha256" in m ? m.fileSha256 ? Buffer.from(m.fileSha256).toString("hex") : null : null;
      content.url = "url" in m ? m.url ? m.url : null : null;
      break;
    }
  }
  if (info?.quotedMessage) {
    const remoteJid = info.remoteJid ?? "";
    const participant = info.participant ?? "";
    const id = info.stanzaId ?? "";
    const addressingMode = /lid^/.test(info.participant ?? "") ? "lid" : "pn";
    const fromMe = info.participant === bot.me.lid || info.participant === bot.me.pn;
    const quoted: WAMessage = {
      key: {
        remoteJid,
        participant,
        id,
        addressingMode,
        fromMe,
      },
      message: info.quotedMessage,
    };
    content.quoted = serializeMessage(quoted, bot);
  }
  content.links = [];
  if (content.text) {
    for (const raw of content.text.split(/\s+/).filter(Boolean)) {
      const link = raw.replace(/[.,!?;:)\]]+$/g, "");
      if (isLink(link)) {
        content.links.push(new URL(link).href);
      }
    }
  }
  return content;
}
