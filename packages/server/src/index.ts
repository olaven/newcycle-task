import { restApi } from "./rest-api";
import express from "express";
import cors from "cors";
import { SSEServer } from "./server-side-events";

express()
  .use(cors())
  .use(restApi)
  .use(SSEServer)
  .listen(process.env.PORT, () => {
    console.log(`> Ready on http://localhost:${process.env.PORT}`);
  });
