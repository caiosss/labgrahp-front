import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";

@Injectable()
export class TokenService {
  createSessionToken() {
    return this.createOpaqueToken("lg_sess");
  }

  createShareToken() {
    return this.createOpaqueToken("lg_share");
  }

  hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private createOpaqueToken(prefix: string) {
    const randomPart = randomBytes(32).toString("base64url");

    return `${prefix}_${randomPart}`;
  }
}
