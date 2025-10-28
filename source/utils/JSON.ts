import { isArray, isRecord, isString } from "./helpers.js";

export function JSONparse<T>(raw: string, reviver?: Optional<(key: string, value: unknown) => unknown>): Nullable<T> {
  try {
    if (!isString(raw)) {
      return null;
    }
    return JSON.parse(raw, reviver);
  }
  catch {
    return null;
  }
}
export function JSONstringify(object: unknown, replacer?: Optional<(key: string, value: unknown) => unknown>, space?: Optional<string | number>): Nullable<string> {
  try {
    if (!isRecord(object) && !isArray(object)) {
      return null;
    }
    return JSON.stringify(object, replacer, space);
  }
  catch {
    return null;
  }
}
