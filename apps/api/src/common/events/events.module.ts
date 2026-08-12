import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IdentityEventsConsumer } from "./identity-events.consumer";

@Module({
    providers: [
        PrismaService,
        IdentityEventsConsumer,
    ],
})
export class EventsModule { }