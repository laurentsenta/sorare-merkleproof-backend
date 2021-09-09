import * as dotenv from "dotenv";
dotenv.config();

import { makeApp } from "./api";
import './sentry';

const PORT = process.env.PORT || '3000';

// const args = process.argv.slice(2);
// const [cmd, ...rest] = args;

(async () => {
  const app = makeApp();
  app.listen(PORT, () => {
    console.log("Express Listening at http://localhost:" + PORT);
  })
})();
