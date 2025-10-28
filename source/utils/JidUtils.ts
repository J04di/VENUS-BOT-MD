import { jidNormalizedUser } from "baileys";

export class JidUtils {
  private jid: string;
  constructor(jid: string) {
    this.jid = jidNormalizedUser(jid);
  }
  public getNumber(): number {
    return Number(this.jid.match(/^\d+/)?.[0] ?? 0);
  }
  public getServer(): string {
    return this.jid.match(/@(.*)$/)?.[1] ?? "";
  }
  public decode() {
    return {
      number: this.getNumber(),
      server: this.getServer(),
    };
  }
}
