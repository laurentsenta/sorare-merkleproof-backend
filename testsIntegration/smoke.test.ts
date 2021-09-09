// import { makeApp } from "../src/api";

// import * as request from "supertest";

// const USER = process.env.API_BASIC_USER;
// const PASS = process.env.API_BASIC_PASS;

let app = null;


beforeAll(async () => {
  // app = makeApp(publisher);
});

/**
 * Smoke test the status endpoint
 */
describe("GET /status", () => {
  it("respond with a 200 status", async () => {
    // await request(app).get("/status").expect(200);
  });
});
