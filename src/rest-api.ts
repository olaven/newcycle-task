import express from "express";
import * as kall from "kall";
import { database } from "./database/database";
import { withValidatedPayload } from "./middleware";
import { schemas } from "./schemas";

export const restApi = express()
  .use(express.json())
  .post(
    "/items",
    withValidatedPayload(
      schemas.postItemInstance,
      async (request, response, payload) => {
        //TODO: if base item does not exist, throw

        const created = database.items.persistItem(payload);
        return response.status(kall.CREATED).send(created);
      }
    )
  )
  .put(
    "/items/:itemId/ownership",
    withValidatedPayload(
      schemas.putItemOwnership,
      async (request, response, { to }) => {
        const { itemId } = request.params;
        const item = await database.items.getItem({ itemId });
        if (!item) {
          return response.status(kall.NOT_FOUND);
        }

        await database.items.registerTransfer({
          item,
          to,
        });
        return response.status(kall.UPDATED);
      }
    )
  );
