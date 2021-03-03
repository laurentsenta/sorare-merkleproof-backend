// import * as winston from "winston";

// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(winston.format.splat(), winston.format.json()),
//   transports: [
//     new winston.transports.File({ filename: "error.log", level: "error" }),
//     new winston.transports.File({ filename: "combined.log" }),
//   ],
// });

// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       level: "silly",
//       format: winston.format.combine(
//         winston.format.splat(),
//         winston.format.simple()
//       ),
//     })
//   );
// }
import debug from 'debug';

export type Debugger = debug.Debugger;

export const logger = (name: string) => debug(name);

export function dbg<T>(message: string, x: T): T {
  console.debug(message, x);
  return x;
}

export const makeLogger = (name: string) => {
  const prefix = `[${name}]`;
  return {
    inTestEnv: (msg: string, ...args: any[]) =>
      console.debug(`${prefix}: ${msg}`, ...args),
    inProdEnv: (msg: string, ...args: any[]) =>
      console.info(`${prefix}: ${msg}`, ...args),
    toInvestigateTomorrow: (msg: string, ...args: any[]) =>
      console.warn(`${prefix}: ${msg}`, ...args),
    wakeMeUpInTheMiddleOfTheNight: (msg: string, ...args: any[]) =>
      console.error(`${prefix}: ${msg}`, ...args),
    makeLogger: (subName: string) => makeLogger(`${name}.${subName}`),
  };
};
