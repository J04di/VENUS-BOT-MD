import fs from "node:fs";
import { BSONdeserialize, BSONserialize } from "../utils/BSON.js";
import path from "node:path";
import { AES256Cipher } from "../utils/AES256Cipher.js";
import { app } from "../core/app.js";
import { logger } from "../core/logger.js";
import { isError } from "../utils/helpers.js";

export class CipherDB<T> {
  protected cipher = new AES256Cipher(app.hash);
  protected filepath: string;
  public data: Nullable<T> = null;
  public size: number = 0;
  private logger = logger.child({ name: "CipherDB" });
  constructor(filepath: string) {
    const ext = path.extname(filepath);
    if (/^\.enc$/.test(ext)) {
      const base = ext ? filepath.slice(0, -ext.length) : filepath;
      filepath = `${base}.enc`;
    }
    this.filepath = path.isAbsolute(filepath) ? filepath : path.resolve(filepath);
  }
  public async load(): Promise<void> {
    try {
      const before = Date.now();
      if (!this.data) {
        try {
          await fs.promises.access(this.filepath);
        } catch {
          this.data = <T>{};
          await this.save();
          this.logger.info("Database initialized.");
          return;
        }
      }
      this.logger.info(`Loading database from '${this.filepath}'`);
      const raw = await fs.promises.readFile(this.filepath);
      if (!raw.length) {
        this.logger.warn(`Could not load database from '${this.filepath}'`);
        return;
      }
      this.logger.debug(`Decrypting database with the key '${app.hash}'`);
      const decrypted = this.cipher.decrypt(raw);
      this.logger.debug("Deserializing decrypted database.");
      const deserialized = BSONdeserialize<T>(decrypted);
      if (!deserialized) {
        this.logger.warn("The decrypted database could not be deserialized.");
        return;
      }
      this.data = deserialized;
      this.size = decrypted.length;
      const now = Date.now();
      const ms = now - before;
      this.logger.info(`Database loaded successfully in ${ms} ms.`);
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
    }
  }
  public async save(): Promise<void> {
    try {
      const before = Date.now();
      if (!this.data) {
        this.logger.warn("The database is not loaded.");
        return;
      }
      this.logger.debug("Serializing database to BSON.");
      const serialized = BSONserialize(this.data);
      if (!serialized) {
        this.logger.warn("The database could not be serialized to BSON.");
        return;
      }
      this.logger.debug(`Encrypting serialized databases with the key '$app.{hash}'`);
      const encrypted = this.cipher.encrypt(serialized);
      this.logger.info(`Saving encrypted databases in '${this.filepath}'`);
      await fs.promises.writeFile(this.filepath, encrypted);
      const now = Date.now();
      const ms = now - before;
      this.logger.info(`Database saved successfully in ${ms} ms.`);
    } catch (e) {
      const err = isError(e) ? e : new Error(String(e));
      this.logger.error(err);
    }
  }
}
