import { restApi } from "./rest-api";
import express from "express";
import { SSEServer } from "./server-side-events";

express()
  .use(restApi)
  .use(SSEServer)
  .use(express.static("public"))
  .listen(process.env.PORT, () => {
    console.log(`> Ready on http://localhost:${process.env.PORT}`);
  });
