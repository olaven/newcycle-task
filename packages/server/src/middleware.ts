import express from "express";
import zod from "zod";

/**
 * Validates `request.body` in accordance
 * with the given `schema`.
 *
 * Intended to be passed as an express handler.
 * E.g. express().put("/path", withValidatedPayload(...))
 */
export function withValidatedPayload<T extends zod.ZodRawShape>(
  schema: zod.ZodObject<T, "strict">,
  handler: (
    request: express.Request,
    response: express.Response,
    payload: zod.infer<typeof schema>
  ) => express.Response | Promise<express.Response>
): express.RequestHandler {
  return function (request: express.Request, response: express.Response) {
    const result = schema.parse(request.body);
    return handler(request, response, result);
  };
}
