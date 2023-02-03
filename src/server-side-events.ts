import express from "express";
import { database } from "./database/database";
import { Channel, Statistic, StatisticsFunction } from "./messaging";
import { TimeUnit } from "./schemas";
import postgresSubscriber from "pg-listen";

/**
 * would have to be stored elsewhere
 * (redis, other db?) to retain clients between
 * restarts or server instances
 */
const clients: {
  [key in Channel]: {
    id: number;
    response: express.Response<any, Record<string, any>>;
  }[];
} = {
  [Channel.TRANSFER_UPDATE]: [],
  [Channel.ITEM_CREATION]: [],
};

//TODO: how to hook into database inserts?
function sendStatisticEvent(channel: Channel, newMessage: Statistic) {
  clients[channel].forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newMessage)}\n\n`)
  );
}

const subscriber = postgresSubscriber();

subscriber.connect().then(() => {
  subscriber.listenTo(Channel.ITEM_CREATION);
  subscriber.listenTo(Channel.TRANSFER_UPDATE);

  subscriber.notifications.on(Channel.ITEM_CREATION, (payload) => {
    console.log("GOT PAYLOAD", payload);
  });

  subscriber.notifications.on(Channel.TRANSFER_UPDATE, (payload) => {
    console.log("GOT HERE");
    console.log("GOT PAYLOAD", payload);
  });

  subscriber.events.on("error", (error) => {
    console.error("Fatal database connection error:", error);
    process.exit(1);
  });

  process.on("exit", () => {
    console.log("Closing server side sub");
    subscriber.close();
  });
  console.log("server side sub connected");
});

export const SSEServer = express()
  .use(express.json())
  //TODO: validate :interval
  .get(
    "/statistics/transfers/:timeUnit",
    setupStatisticsEndpoint(
      database.statistics.getTransferStatistics,
      Channel.TRANSFER_UPDATE
    )
  )
  .get(
    "/statistics/item-creation/:timeUnit",
    setupStatisticsEndpoint(
      database.statistics.getCreationStatistics,
      Channel.ITEM_CREATION
    )
  );

function setupStatisticsEndpoint<T>(
  getStatistics: StatisticsFunction,
  channel: Channel
) {
  return async function registrationHandler(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    //TODO: validate :interval
    const { timeUnit } = request.params;
    const statistics = await getStatistics({ timeUnit: timeUnit as TimeUnit });

    //NOTE: adapted from https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };
    response.writeHead(200, headers);

    const data = `data: ${JSON.stringify(statistics)}\n\n`;

    response.write(data);

    const newClient = {
      id: Date.now(),
      response,
    };

    clients[channel].push(newClient);

    request.on("close", () => {
      console.log(`${newClient.id} Connection closed`);
      clients[channel] = clients[channel].filter(
        (client) => client.id !== newClient.id
      );
    });
  };
}
