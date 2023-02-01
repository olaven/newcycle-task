import zod from "zod";

const postItemInstance = zod
  .object({
    base_item_id: zod.string().uuid(),
  })
  .strict();

const putItemOwnership = zod
  .object({
    to: zod.string().uuid(),
  })
  .strict();

export const schemas = {
  putItemOwnership,
  postItemInstance,
};
