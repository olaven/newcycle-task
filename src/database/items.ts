import * as klart from "klart";
import { BaseItem, Item, Transfer, User } from "./models";

import { Channel, Subscriber } from "../messaging/messaging";

async function persistItem(options: {
  base_item_id: string;
  subscriber: Promise<Subscriber>;
}) {
  const item = await klart.first<Item>(
    `
        INSERT INTO items (base_item_id) 
        VALUES ($1)
        RETURNING *
        `,
    [options.base_item_id]
  );

  (await options.subscriber).notify(Channel.ITEM_CREATION, item);
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

async function registerTransfer(options: {
  item: Item;
  to: string;
  subscriber: Promise<Subscriber>;
}) {
  const transfer = await klart.first<Transfer>(
    `
      INSERT INTO transfers (item_id, owner_id) 
      VALUES ($1, $2)
      RETURNING *;
    `,
    [options.item.id, options.to]
  );

  await (await options.subscriber).notify(Channel.TRANSFER_UPDATE, transfer);
  return transfer;
}

export const items = {
  persistItem,
  persistBaseItem,
  getItem,
  registerTransfer,
  getOwner,
};
