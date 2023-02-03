import express from "express";
import { database } from "./database/database";
import { Statistic, StatisticsFunction } from "./database/statistics";
import { Channel, getPostgresSubscriber } from "./messaging/messaging";
import { TimeUnit } from "./schemas";

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

function publishToClients(channel: Channel, newMessage: Statistic) {
  console.log("PUBLISHING TO CLIENTS", clients);
  clients[channel].forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newMessage)}\n\n`)
  );
}

getPostgresSubscriber()
  .then((subscriber) => {
    subscriber.listenTo(Channel.ITEM_CREATION);
    subscriber.notifications.on(Channel.ITEM_CREATION, (payload) => {
      //NOTE: PUBLISHES THE NEW THING, __NOT__ UPDATED STATISTICS
      console.log("CAUGHT NOTIFY ON SERVER");
      publishToClients(Channel.ITEM_CREATION, payload);
    });
  })
  .catch(console.error);

getPostgresSubscriber()
  .then((subscriber) => {
    subscriber.listenTo(Channel.TRANSFER_UPDATE);
    subscriber.notifications.on(Channel.TRANSFER_UPDATE, (payload) => {
      //NOTE: PUBLISHES THE NEW THING, __NOT__ UPDATED STATISTICS
      publishToClients(Channel.TRANSFER_UPDATE, payload);
    });
  })
  .catch(console.error);

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
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    const data = `data: ${JSON.stringify(statistics)}\n\n`;

    response.write(data);

    const newClient = {
      id: Date.now(),
      response,
    };

    clients[channel] = [...clients[channel], newClient];

    request.on("close", () => {
      console.log(`${newClient.id} Connection closed`);
      clients[channel] = clients[channel].filter(
        (client) => client.id !== newClient.id
      );
    });
  };
}
