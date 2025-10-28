declare module "node-webpmux" {
  export class Image {
    constructor();
    exif: Buffer;
    load: (input: Buffer | string) => Promise<void>;
    save: (path: null, options?: Optional<Record<string, unknown>>) => Promise<Buffer>;
    save: (path: string, options?: Optional<Record<string, unknown>>) => Promise<void>;
  }
}
