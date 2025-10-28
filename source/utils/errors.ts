import { CustomError } from "./CustomError.js";

export class InvalidInput extends CustomError {
  constructor(message: string) {
    super(message, {
      code: "INVALID_INPUT",
    });
  }
}
export class InvalidLength extends CustomError {
  constructor(message: string) {
    super(message, {
      code: "INVALID_LENGTH",
    });
  }
}
export class FFmpegError extends CustomError {
  constructor(message: string) {
    super(message, {
      code: "FFMPEG_ERROR",
    });
  }
}
export class InvalidPath extends CustomError {
  constructor(message: string) {
    super(message, {
      code: "INVALID_PATH",
    });
  }
}
