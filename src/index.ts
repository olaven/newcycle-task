import express from "express";
import * as klart from "klart";

export const app = express()
  .use(express.json())
  .get("/TODO", async (request, response) => {
    const result = await klart.first("SELECT * FROM SOMETHING");
    console.log({ result });
  })
  .listen(process.env.PORT, () => {
    console.log(`> Ready on http://localhost:${process.env.PORT}`);
  });
