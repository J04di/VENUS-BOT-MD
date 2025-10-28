import path from "node:path";
import type { IPlugin } from "../types/Plugin.js"
import fs from "node:fs";
import { InvalidPath } from "./errors.js";
import { logger } from "../core/logger.js";

export class PluginsManager {
  private cache = new Map<string, IPlugin>();
  private directory: string;
  private logger = logger.child({ name: "Plugin" });
  constructor(directory: string) {
    this.directory = path.isAbsolute(directory) ? directory : path.resolve(directory);
  }
  public async load(): Promise<void> {
    const before = Date.now();
    const stats = await fs.promises.stat(this.directory);
    if (!stats.isDirectory()) {
      throw new InvalidPath(`'${this.directory}' is not a valid directory.`);
    }
    this.logger.info(`Loading plugins from '${this.directory}'`);
    const files = (await fs.promises.readdir(this.directory)).filter((v) => /\.(t|j)s$/.test(v));
    if (!files.length) {
      this.logger.warn(`There is no plugin in '${this.directory}' to load.`);
      return;
    }
    for (const file of files) {
      this.logger.trace(`Loading plugin '${file}'`);
      const { plugin }: { plugin: IPlugin } = await import(path.join(this.directory, file));
      if (!plugin) {
        this.logger.warn(`'${file}' is not a valid plugin.`);
        continue;
      }
      this.logger.trace(`Plugin '${file}' loaded successfully.`);
      this.cache.set(plugin.name, plugin);
    }
    const now = Date.now();
    const ms = now - before;
    this.logger.info(`${this.size} plugins loaded successfully in ${ms} ms.`);
  }
  public get(name: string): Nullable<IPlugin> {
    return this.cache.get(name) ?? null;
  }
  public getAll(): IPlugin[] {
    return this.cache.values().toArray();
  }
  public get size() {
    return this.cache.size;
  }
}
