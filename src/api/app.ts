import { makeLogger } from "@gazebo/utils";
import cors from "cors";
import express from "express";

const log = makeLogger("app");

export const makeApp = () => {
  const app = express();

  // app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    log.inTestEnv(">>>", req.method, req.path, req.query, req.params, req.body);

    // onFinished(res, (err, res) => {
    //   if (err) {
    //     log.toInvestigateTomorrow(
    //       req.method,
    //       req.path,
    //       req.query,
    //       req.body,
    //       res.statusCode,
    //       err
    //     );
    //   } else {
    //     log.inTestEnv(
    //       "<<<",
    //       req.method,
    //       req.path,
    //       req.query,
    //       req.body,
    //       res.statusCode
    //     );
    //   }
    // });

    next();
  });

  // app.use((err, _req, _res, next) => {
  //   log.wakeMeUpInTheMiddleOfTheNight(err);
  //   next(err);
  // });

  app.get("/status", (_req, res) => {
    res.send("OK");
  });

  return app;
};
