import basicAuth from "basic-auth";
import { NextFunction, Request, Response } from "express";

const USER = process.env.API_BASIC_USER;
const PASS = process.env.API_BASIC_PASS;

const unauthorized = (res: any) => {
  res.set("WWW-Authenticate", "Basic realm=Authorization Required");
  return res.send(401);
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name === USER && user.pass === PASS) {
    return next();
  } else {
    return unauthorized(res);
  }
};
