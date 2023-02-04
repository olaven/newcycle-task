import express from "express";
import { database } from "./database/database";
import { Statistic, StatisticsFunction } from "./database/statistics";
import { Channel, getPostgresSubscriber } from "./messaging/messaging";
import { TimeUnit } from "./schemas";

type Client = {
  id: number;
  response: express.Response<any, Record<string, any>>;
  getUpdate: (latest: Date) => Promise<Statistic[]>;
  latestDataPoint: Date;
};
/**
 * would have to be stored elsewhere
 * (redis, other db?) to retain clients between
 * restarts or server instances
 */
const clients: {
  [key in Channel]: {
    [key in string]: Client;
  };
} = {
  [Channel.TRANSFER_UPDATE]: {},
  [Channel.ITEM_CREATION]: {},
};

function upsertStatisticsClient(
  options: Client & { id?: number; channel: Channel }
) {
  console.log("upserting with", options.latestDataPoint);
  const newClient = {
    id: options.id ?? Date.now(),
    response: options.response,
    latestDataPoint: options.latestDataPoint,
    getUpdate: options.getUpdate,
  };

  clients[options.channel][newClient.id] = newClient;

  return newClient;
}

async function publishToClients(channel: Channel) {
  const allClients = Object.values(clients[channel]);
  console.log({ allClients });
  await Promise.all(
    allClients.map(async (client) => {
      const updates = await client.getUpdate(client.latestDataPoint);
      upsertStatisticsClient({
        ...client,
        latestDataPoint: new Date(),
        channel,
      });
      return client.response.write(`data: ${JSON.stringify(updates)}\n\n`);
    })
  );
}

getPostgresSubscriber()
  .then((subscriber) => {
    subscriber.listenTo(Channel.ITEM_CREATION);
    subscriber.notifications.on(Channel.ITEM_CREATION, async () => {
      await publishToClients(Channel.ITEM_CREATION);
    });

    subscriber.listenTo(Channel.TRANSFER_UPDATE);
    subscriber.notifications.on(Channel.TRANSFER_UPDATE, async () => {
      await publishToClients(Channel.TRANSFER_UPDATE);
    });
  })
  .catch(console.error);

export const SSEServer = express()
  .use(express.json())
  .get("/test", (_, response) => {
    return response.status(200).send("Something else");
  })
  .get(
    "/statistics/transfers/:timeUnit",
    setupSSEEndpoint(
      database.statistics.getTransferStatistics,
      Channel.TRANSFER_UPDATE
    )
  )
  .get(
    "/statistics/item-creation/:timeUnit",
    setupSSEEndpoint(
      database.statistics.getCreationStatistics,
      Channel.ITEM_CREATION
    )
  );

function setupSSEEndpoint<T>(
  getStatistics: StatisticsFunction,
  channel: Channel
) {
  return async function registrationHandler(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    const timeUnit = request.params.timeUnit as TimeUnit;
    const statistics = await getStatistics({ timeUnit, from: new Date(0) });

    //NOTE: adapted from https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    response.write(`data: ${JSON.stringify(statistics)}\n\n`);

    const latestData =
      statistics.length > 0
        ? new Date(statistics[statistics.length - 1].time)
        : new Date(0);

    const newClient = upsertStatisticsClient({
      id: undefined,
      latestDataPoint: latestData,
      response,
      channel,
      getUpdate: (latest) => getStatistics({ timeUnit, from: latest }),
    });

    request.on("close", () => {
      console.log(`${newClient.id} Connection closed`);
      clients[channel][newClient.id] = undefined;
    });
  };
}
