import express from "express";
import { database } from "./database/database";
import { getPostgresSubscriber } from "./messaging/messaging";
import { withValidatedPayload } from "./middleware";
import { schemas } from "./schemas";

const subscriber = getPostgresSubscriber();
export const restApi = express()
  .use(express.json())
  .post(
    "/items",
    withValidatedPayload(
      schemas.postItem,
      async (request, response, payload) => {
        const created = await database.items.persistItem({
          base_item_id: payload.base_item_id,
          subscriber: subscriber,
        });

        return response.status(201).send(created);
      }
    )
  )
  .put(
    "/items/:itemId/ownership",
    withValidatedPayload(
      schemas.putItemOwnership,
      async (request, response, { to }) => {
        const transfer = await database.items.registerTransfer({
          item_id: request.params.itemId,
          to,
          subscriber,
        });

        return response.status(204).send();
      }
    )
  );
