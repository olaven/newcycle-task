import zod from "zod";

const postItem = zod
  .object({
    base_item_id: zod.string().uuid(),
  })
  .strict();

const putItemOwnership = zod
  .object({
    to: zod.string().uuid(),
  })
  .strict();

export enum TimeUnit {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

const getCreationStatistics = zod
  .object({
    time: zod.nativeEnum(TimeUnit),
  })
  .strict();

export const schemas = {
  putItemOwnership,
  postItem,
  getCreationStatistics,
};
