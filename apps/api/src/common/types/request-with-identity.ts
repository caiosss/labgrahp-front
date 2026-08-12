import type { Request } from "express"

export interface RequestIdentity {
    userId: string;
}

export interface RequestWithIdentity extends Request {
    identity?: RequestIdentity;
}