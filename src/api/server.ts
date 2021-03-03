import { Express } from "express";
import * as http from "http";

const PORT = process.env.PORT || '3000';

export class Server {
  private readonly app: Express;
  private server: http.Server | null;

  public constructor(app: Express) {
    this.app = app;
    this.server = null;
  }

  public async start() {
    if (this.server) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.server = this.app.listen(PORT, () => {
        console.log("Express Listening at http://localhost:" + PORT);
        resolve();
      });
    });
  }

  public async stop() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }
}
