import type { MessageType, WAMessage } from "baileys";

export interface IMessageFromPrivate {
  lid: string;
  pn: string;
  isPrivate: true;
  isGroup: false;
}
export interface IMessageFromGroup {
  id: string;
  addressingMode: "lid" | "pn";
  isPrivate: false;
  isGroup: true;
}
export interface IMessageSender {
  lid: string;
  pn: string;
  nickname: string;
}
export interface IMessageContent {
  type: MessageType;
  links: string[];
  text: string;
  mimetype: string;
  mentioned: string[];
  size: number;
  hash: Nullable<string>;
  url: Nullable<string>;
  quoted: Nullable<ISerializedMessage>;
}
export interface ISerializedMessage {
  id: string;
  from: IMessageFromPrivate | IMessageFromGroup;
  fromMe: boolean;
  sender: IMessageSender;
  message: IMessageContent;
  original: WAMessage;
}
