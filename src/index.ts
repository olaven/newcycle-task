import { restApi } from "./rest-api";
import { bootWebsocketServer } from "./websocket";

bootWebsocketServer();

restApi.listen(process.env.PORT, () => {
  console.log(`> Ready on http://localhost:${process.env.PORT}`);
});
