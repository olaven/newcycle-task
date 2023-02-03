import * as klart from "klart";
import { PostItemInstance } from "../schemas";
import { BaseItem, Item, Transfer, User } from "./models";

import postgresSubscriber from "pg-listen";
import { Channel } from "../messaging";

const subscriber = postgresSubscriber();

subscriber.connect().then(() => {
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
    console.log("Closing database side sub");
    subscriber.close();
  });

  console.log("database sub connected");
});
async function persistItem(options: PostItemInstance) {
  const item = await klart.first<Item>(
    `
        INSERT INTO items (base_item_id) 
        VALUES ($1)
        RETURNING *
        `,
    [options.base_item_id]
  );

  await subscriber.notify(Channel.ITEM_CREATION, item);
  console.log(`Notified on ${Channel.ITEM_CREATION}`);
  return item;
}

function getItem(options: { itemId: string }) {
  return klart.first<Item>(
    `
          SELECT * FROM items 
          WHERE id = $1
      `,
    [options.itemId]
  );
}

/**
 * Returns the user associated with
 * the latest transfer on this item.
 */
function getOwner(options: { item: Item }) {
  return klart.first<User>(
    `
        SELECT * FROM users WHERE id IN (
          SELECT transfers.owner_id as id FROM items 
          JOIN transfers
          ON transfers.item_id = items.id 
          WHERE items.id = $1
          ORDER BY transfers.timestamp DESC
          LIMIT 1
        );
      `,
    [options.item.id]
  );
}

function persistBaseItem(options: { description: string }) {
  return klart.first<BaseItem>(
    `
          INSERT INTO base_items (description) 
          VALUES ($1)
          RETURNING *
      `,
    [options.description]
  );
}

function registerTransfer(options: { item: Item; to: string }) {
  return klart.first<Transfer>(
    `
      INSERT INTO transfers (item_id, owner_id) 
      VALUES ($1, $2)
      RETURNING *;
    `,
    [options.item.id, options.to]
  );
}

export const items = {
  persistItem,
  persistBaseItem,
  getItem,
  registerTransfer,
  getOwner,
};
