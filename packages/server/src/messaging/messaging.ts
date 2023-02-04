import postgresSubscriber from "pg-listen";

export enum Channel {
  TRANSFER_UPDATE = "transfer_update",
  ITEM_CREATION = "item_creation",
}

export type Subscriber = Awaited<ReturnType<typeof getEventSubscriber>>;

type Listeners = Partial<Record<Channel, (channel: Channel) => Promise<void>>>;

export async function getEventSubscriber(options: { listeners: Listeners }) {
  const subscriber = postgresSubscriber();
  await subscriber.connect();

  subscriber.events.on("error", (error) => {
    console.error("Fatal database connection error:", error);
    process.exit(1);
  });

  process.on("exit", () => {
    console.log("Closing server side sub exited");
    subscriber.close();
  });

  Object.entries(options.listeners).forEach(([channel, handler]) => {
    subscriber.listenTo(channel);
    subscriber.notifications.on(channel, (_) => handler(channel as Channel));
  });

  return subscriber;
}
