import express from "express";
import * as kall from "kall";
import { withValidatedPayload } from "./middleware";
import { schemas } from "./schemas";

export const app = express()
  .use(express.json())
  //TODO: item creation
  .post(
    "/items",
    withValidatedPayload(
      schemas.postItemInstance,
      async (request, response, payload) => {
        //TODO: if base item does not exist, throw

        const created = database.persistItemInstance(payload);
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
        const item = await database.getItem(itemId);
        if (!item) {
          return response.status(kall.NOT_FOUND);
        }

        await database.transferOwnership({
          item,
          to,
        });
        return response.status(kall.UPDATED);
      }
    )
  )
  .listen(process.env.PORT, () => {
    console.log(`> Ready on http://localhost:${process.env.PORT}`);
  });
