import postgresSubscriber from "pg-listen";

export enum Channel {
  TRANSFER_UPDATE = "transfer_update",
  ITEM_CREATION = "item_creation",
}

export type Subscriber = Awaited<ReturnType<typeof getPostgresSubscriber>>;

export async function getPostgresSubscriber() {
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

  return subscriber;
}
