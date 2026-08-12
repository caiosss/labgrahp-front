import { randomUUID } from "node:crypto";

export const IDENTITY_EVENTS_TOPIC = "identity.events";
export const USER_REGISTERED_EVENT = "identity.user.registered.v1";

export const createUserRegisteredEvent = (user) => {
  const eventId = randomUUID();

  return {
    id: eventId,
    topic: IDENTITY_EVENTS_TOPIC,
    eventType: USER_REGISTERED_EVENT,
    aggregateId: user.id,
    payload: {
      eventId,
      eventType: USER_REGISTERED_EVENT,
      occurredAt: new Date().toISOString(),
      producer: "identity-service",
      data: { userId: user.id },
    },
  };
};
