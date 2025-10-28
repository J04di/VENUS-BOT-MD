import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

export class AES256Cipher {
  protected readonly key: Buffer;
  constructor(hash: string) {
    this.key = createHash("sha256").update(hash).digest();
  }
  public encrypt(value: Buffer): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([
      iv,
      tag,
      encrypted,
    ]);
  }
  public decrypt(value: Buffer): Buffer {
    const iv = value.subarray(0, 12);
    const tag = value.subarray(12, 28);
    const data = value.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);
  }
}
