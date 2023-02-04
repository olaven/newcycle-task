import { describe, it, expect, vitest } from "vitest";
import { database } from "./database";
import { faker } from "@faker-js/faker";
import { TimeUnit } from "../schemas";
import { Subscriber } from "../messaging/messaging";

const subscriber = new Promise<Subscriber>((resolve, _) => {
  resolve({
    notify: vitest.fn(() => {
      /**mock implementation */
    }),
  } as any as Subscriber);
});

describe("the database functions", () => {
  async function persistFakeItem() {
    const baseItem = await database.items.persistBaseItem({
      description: faker.lorem.paragraph(),
    });
    const item = await database.items.persistItem({
      base_item_id: baseItem.id,
      subscriber,
    });
    return item;
  }

  describe("persisting an item", () => {
    it("can be run without throwing", async () => {
      const item = await persistFakeItem();
      expect(item).not.to.be.undefined;
      expect(item).not.to.be.null;
    });

    it("returns an item with an ID", async () => {
      const item = await persistFakeItem();
      expect(item.id).not.to.be.undefined;
      expect(item.id).not.to.be.null;
    });

    it("throws if the base item does not exist", async () => {
      expect(() =>
        database.items.persistItem({
          //NOTE: random UUID
          base_item_id: faker.datatype.uuid(),
          subscriber,
        })
      ).rejects.toThrow();
    });
  });

  describe("Getting items", () => {
    it("Does return the correct item", async () => {
      const item = await persistFakeItem();
      const retrieved = await database.items.getItem({ itemId: item.id });
      expect(retrieved.id).to.equal(item.id);
      expect(retrieved.base_item_id).to.equal(item.base_item_id);
    });
  });

  describe("transfering ownership", async () => {
    it("change owner after transfer", async () => {
      const userA = await database.users.persistUser();
      const userB = await database.users.persistUser();

      const item = await persistFakeItem();
      await database.items.registerTransfer({
        item_id: item.id,
        to: userA.id,
        subscriber,
      });

      const ownerAfterTransferToA = await database.items.getOwner({ item });

      await database.items.registerTransfer({
        item_id: item.id,
        to: userB.id,
        subscriber,
      });

      const ownerAfterTransferToB = await database.items.getOwner({ item });

      expect(ownerAfterTransferToA.id).to.equal(userA.id);
      expect(ownerAfterTransferToB.id).to.equal(userB.id);
    });
  });

  describe("Statistics for transfer count", () => {
    it("returns time and count", async () => {
      const user = await database.users.persistUser();
      const item = await persistFakeItem();

      await database.items.registerTransfer({
        item_id: item.id,
        to: user.id,
        subscriber,
      });
      await database.items.registerTransfer({
        item_id: item.id,
        to: user.id,
        subscriber,
      });

      const statistics = await database.statistics.getTransferStatistics({
        timeUnit: TimeUnit.MONTH,
        from: new Date(0),
      });

      expect(statistics.length).to.be.greaterThan(0);
      for (const statistic of statistics) {
        expect(statistic.count).toBeDefined();
        expect(statistic.time).toBeDefined();
      }
    });
  });

  describe("Statistics for creation count", () => {
    it("returns time and count", async () => {
      // persisting some items
      for (let i = 0; i <= 10; i++) {
        await persistFakeItem();
      }

      const statistics = await database.statistics.getCreationStatistics({
        timeUnit: TimeUnit.DAY,
        from: new Date(0),
      });
      expect(statistics.length).to.be.greaterThan(0);
      for (const statistic of statistics) {
        expect(statistic.count).toBeDefined();
        expect(statistic.time).toBeDefined();
      }
    });
  });
});
