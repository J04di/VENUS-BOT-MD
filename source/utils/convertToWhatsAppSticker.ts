import webpmux from "node-webpmux";
import { InvalidInput } from "./errors.js";
import { FFmpeg } from "./FFmpeg.js";

export async function convertToWhatsAppSticker(input: Buffer, mimetype: string, hash: string, packName: string, packAuthor: string): Promise<Buffer> {
  if (!/^(image\/(jpe?g|png|gif|webp)|video\/mp4)$/.test(mimetype)) {
    throw new InvalidInput(`The mimetype '${mimetype}' is not supported.`);
  }
  if (mimetype !== "image/webp") {
    const ffmpeg = new FFmpeg(input, {
      mimetype,
    });
    input = await ffmpeg.toWebp();
  }
  const image = new webpmux.Image();
  await image.load(input);
  const metadata = Buffer.from(JSON.stringify({
    "sticker-pack-id": hash,
    "sticker-pack-name": packName,
    "sticker-pack-publisher": packAuthor,
    "is-ai-sticker": 1,
  }), "utf8");
  const exif = Buffer.concat([
    Buffer.from("SUkqAAgAAAABAEFXBwAAAAAAFgAAAA==", "base64"),
    metadata,
  ]);
  exif.writeUIntLE(metadata.length, 14, 4);
  image.exif = exif;
  return image.save(null);
}
