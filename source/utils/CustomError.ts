import type { ICustomErrorOptions } from "../types/CustomError.js";

export class CustomError extends Error {
  public readonly code?: Nullable<string>;
  public readonly statusCode?: Nullable<number>;
  public readonly details?: Nullable<unknown>;
  constructor(message: string, options?: Optional<ICustomErrorOptions>) {
    super(message, options);
    this.name = options?.name ?? new.target.name;
    this.code = options?.code ?? null;
    this.statusCode = options?.statusCode ?? null;
    this.details = options?.details ?? null;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}
