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

export type PostItemInstance = zod.infer<typeof postItem>;
export type PutItemOwnership = zod.infer<typeof putItemOwnership>;

export const schemas = {
  putItemOwnership,
  postItemInstance: postItem,
  getCreationStatistics,
};
