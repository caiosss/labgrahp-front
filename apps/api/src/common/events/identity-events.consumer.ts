import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { Kafka, logLevel } from "kafkajs";
import { PrismaService } from "../database/prisma.service";

const IDENTITY_EVENTS_TOPIC = "identity.events";
const USER_REGISTERED_EVENT = "identity.user.registered.v1";

interface IdentityEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  producer: string;
  data: { userId: string };
}

@Injectable()
export class IdentityEventsConsumer
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(IdentityEventsConsumer.name);
  private readonly consumer;
  private reconnectTimer?: NodeJS.Timeout;
  private isRunning = false;
  private isStopping = false;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
      .split(",")
      .map((broker) => broker.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? "project-service",
      brokers,
      logLevel: logLevel.WARN,
    });

    this.consumer = kafka.consumer({
      groupId:
        process.env.KAFKA_IDENTITY_GROUP_ID ??
        "project-service-identity-v1",
    });
  }

  onApplicationBootstrap() {
    void this.startConsumer();
  }

  private async startConsumer() {
    if (this.isRunning || this.isStopping) return;

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: IDENTITY_EVENTS_TOPIC,
        fromBeginning: true,
      });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (!message.value) return;

          const event = this.parseEvent(message.value.toString());
          if (!event || event.eventType !== USER_REGISTERED_EVENT) return;

          const result = await this.prisma.inboxEvent.createMany({
            data: [
              {
                eventId: event.eventId,
                eventType: event.eventType,
                topic,
                partition,
                offset: message.offset,
              },
            ],
            skipDuplicates: true,
          });

          if (result.count === 0) {
            this.logger.debug(`Evento duplicado ignorado: ${event.eventId}`);
            return;
          }

          this.logger.log(
            `Usuário registrado recebido: ${event.data.userId}`,
          );
        },
      });

      this.isRunning = true;
      this.logger.log("Consumer Kafka iniciado.");
    } catch (error) {
      this.logger.error(
        "Não foi possível iniciar o consumer Kafka. Nova tentativa em 5 segundos.",
        error instanceof Error ? error.stack : String(error),
      );

      if (!this.isStopping) {
        this.reconnectTimer = setTimeout(() => {
          void this.startConsumer();
        }, 5_000);
        this.reconnectTimer.unref?.();
      }
    }
  }

  async onApplicationShutdown() {
    this.isStopping = true;

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.isRunning) await this.consumer.disconnect();
  }

  private parseEvent(value: string): IdentityEvent | null {
    try {
      const event = JSON.parse(value) as Partial<IdentityEvent>;

      if (
        typeof event.eventId !== "string" ||
        typeof event.eventType !== "string" ||
        typeof event.data?.userId !== "string"
      ) {
        this.logger.warn("Evento Kafka inválido ignorado.");
        return null;
      }

      return event as IdentityEvent;
    } catch {
      this.logger.warn("Mensagem Kafka com JSON inválido ignorada.");
      return null;
    }
  }
}
