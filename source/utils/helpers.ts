import { Readable } from "node:stream";
import { JSONstringify } from "./JSON.js";
import { randomBytes } from "node:crypto";
import { Boom } from "@hapi/boom";

export function isError(arg: unknown): arg is Error {
  return arg instanceof Error;
}
export function isBoom(arg: unknown): arg is Boom {
  return arg instanceof Boom;
}
export function isRecord(arg: unknown): arg is Record<string, unknown> {
  return Object.prototype.toString.call(arg) === "[object Object]";
}
export function isArray(arg: unknown): arg is unknown[] {
  return Object.prototype.toString.call(arg) === "[object Array]";
}
export function isString(arg: unknown): arg is string {
  return typeof arg === "string";
}
export function isNumber(arg: unknown): arg is number {
  return typeof arg === "number" && !isNaN(arg);
}
export function isBuffer(arg: unknown): arg is Buffer {
  return Buffer.isBuffer(arg);
}
export function isReadable(arg: unknown): arg is Readable {
  return arg instanceof Readable;
}
export function toString(value: unknown): string {
  if (isRecord(value) || isArray(value)) {
    value = JSONstringify(value) ?? value;
  }
  return String(value).trim();
}
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function ObjectKeys<T>(value: T): (keyof T)[] {
  if (!isRecord(value)) {
    return [];
  }
  return Object.keys(value) as (keyof T)[];
}
export function randomId(size: number): string {
  const bytes = randomBytes(Math.ceil(size / 2));
  return bytes.toString("hex").slice(0, size);
}
export function isLink(arg: string): boolean {
  try {
    new URL(arg);
    return true;
  } catch {
    return false;
  }
}
