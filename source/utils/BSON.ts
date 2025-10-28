import { BSON } from "bson";
import { isBuffer, isRecord } from "./helpers.js";

export function BSONdeserialize<T = Record<string, unknown>>(raw: Buffer): Nullable<T> {
  try {
    if (!isBuffer(raw)) {
      return null;
    }
    return BSON.deserialize(raw) as T;
  }
  catch {
    return null;
  }
}
export function BSONserialize(object: Record<string, unknown>): Nullable<Buffer> {
  try {
    if (!isRecord(object)) {
      return null;
    }
    return Buffer.from(BSON.serialize(object));
  }
  catch {
    return null;
  }
}
