import { prisma } from "../database/prisma.mjs";
import { kafkaProducer } from "./kafka.mjs";

const POLL_INTERVAL_MS = 2000;
const BATCH_SIZE = 20;

let timer;
let isPublishing = false;
let isConnected = false;
let isStopping = false;

const ensureConnected = async () => {
  if (isConnected) return;
  await kafkaProducer.connect();
  isConnected = true;
};

const markFailure = async (event, error) => {
  await prisma.outboxEvent.update({
    where: { id: event.id },
    data: {
      attempts: { increment: 1 },
      lastError:
        error instanceof Error
          ? error.message.slice(0, 1000)
          : "Erro desconhecido ao publicar evento.",
    },
  });
};

export const publishPendingOutboxEvents = async () => {
  if (isPublishing || isStopping) return;
  isPublishing = true;

  try {
    await ensureConnected();

    const events = await prisma.outboxEvent.findMany({
      where: { publishedAt: null },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    for (const event of events) {
      if (isStopping) break;

      try {
        await kafkaProducer.send({
          topic: event.topic,
          acks: -1,
          messages: [
            {
              key: event.aggregateId,
              value: JSON.stringify(event.payload),
              headers: {
                eventId: event.id,
                eventType: event.eventType,
              },
            },
          ],
        });

        await prisma.outboxEvent.updateMany({
          where: { id: event.id, publishedAt: null },
          data: { publishedAt: new Date(), lastError: null },
        });
      } catch (error) {
        console.error(`Falha ao publicar evento ${event.id}.`, error);
        await markFailure(event, error);
      }
    }
  } catch (error) {
    console.error("Falha no ciclo do Outbox Publisher.", error);
    isConnected = false;
  } finally {
    isPublishing = false;
  }
};

export const startOutboxPublisher = () => {
  isStopping = false;
  void publishPendingOutboxEvents();
  timer = setInterval(() => void publishPendingOutboxEvents(), POLL_INTERVAL_MS);
  timer.unref?.();
};

export const stopOutboxPublisher = async () => {
  isStopping = true;
  if (timer) clearInterval(timer);

  while (isPublishing) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  if (isConnected) {
    await kafkaProducer.disconnect();
    isConnected = false;
  }
};
