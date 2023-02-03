import { WebSocketServer } from "ws";

function initializeWebsocketServer() {
  const { WS_PORT } = process.env;
  if (!WS_PORT) {
    throw "Could not start WS server due to missing WS_PORT";
  }

  const port = parseInt(WS_PORT);
  if (!port || isNaN(port)) {
    throw "WS_PORT was not a valid number";
  }

  return new WebSocketServer({ port });
}

//TODO: use WS server to publish statistics
export function bootWebsocketServer() {
  const server = initializeWebsocketServer();
  server.on("connection", function connection(socket) {
    socket.on("error", console.error);

    socket.on("message", function message(data) {
      console.log("received: %s", data);
    });

    socket.send("something");
  });

  return server;
}
