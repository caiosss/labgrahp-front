import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";

@Injectable()
export class SessionsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  create(tokenHash: string) {
    return this.prisma.session.create({
      data: {
        tokenHash,
      },
    });
  }

  findById(sessionId: string) {
    return this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }
}
