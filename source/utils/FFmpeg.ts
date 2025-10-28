import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { isBuffer, randomId } from "./helpers.js";
import { FFmpegError, InvalidInput } from "./errors.js";
import type { IFFmpegOptions } from "../types/FFmpeg.js";
import { paths } from "../core/paths.js";

export class FFmpeg {
  private input: Buffer;
  private mimetype: string;
  private args: string[];
  constructor(input: Buffer, options: IFFmpegOptions) {
    if (!isBuffer(input)) {
      throw new InvalidInput("The input is not a valid buffer.");
    }
    this.input = input;
    this.mimetype = options.mimetype;
    this.args = options.args ?? [];
  }
  public async toWebp(): Promise<Buffer> {
    const ext = this.mimetype.split("/")[1] ?? "bin";
    const filename = randomId(16);
    const inputpath = path.join(paths.tmp, `${filename}.${ext}`);
    const outputpath = path.join(paths.tmp, `${filename}.webp`);
    try {
      if (!/^(jpe?g|png|gif|mp4)$/.test(ext)) {
        throw new InvalidInput(`The mimetype '${this.mimetype}' is not supported.`);
      }
      await fs.promises.writeFile(inputpath, this.input);
      const args: string[] = [
        "-i", inputpath,
        "-vcodec", "libwebp",
        "-lossless", "0",
        "-q:v", "70",
      ];
      if (ext === "mp4") {
        args.push(
          "-vf", "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1,fps=10",
          "-compression_level", "6",
          "-loop", "0",
          "-an",
          "-ss", "00:00:00.0",
          "-t", "00:00:05.0",
        );
      }
      else {
        args.push("-vf", "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1,format=yuv420p");
      }
      args.push(...this.args, outputpath);
      await new Promise<void>((resolve, reject) => {
        spawn("ffmpeg", args)
          .on("error", reject)
          .on("close", (code) => {
            if (code === 0) {
              resolve();
            }
            else {
              reject(new FFmpegError(`FFmpeg exited with code ${code}`));
            }
          });
      });
      const result = await fs.promises.readFile(outputpath);
      return result;
    } finally {
      await Promise.all([
        fs.promises.rm(inputpath, {
          force: true,
          recursive: true,
        }),
        fs.promises.rm(outputpath, {
          force: true,
          recursive: true,
        }),
      ]);
    }
  }
}
