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
