import * as dotenv from "dotenv";

dotenv.config();

import { makeApp, Server } from "./api";
import { MongoDBStorage } from "./data";

// const args = process.argv.slice(2);
// const [cmd, ...rest] = args;

(async () => {
  const storage = await MongoDBStorage.load()
  const app = makeApp(storage);
  const server = new Server(app);
  await server.start();
})();
