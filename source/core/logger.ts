import Logger from "@imjxsx/logger";
import type { LoggerLevel } from "@imjxsx/logger/build/types/index.js";
import { app } from "./app.js";

export const logger = new Logger({
  name: `${app.name} ${app.version}`,
  colorize: process.env["NODE_ENV"] !== "production",
  level: (process.env["LOGGER_LEVEL"] as LoggerLevel) ?? "OFF",
});
