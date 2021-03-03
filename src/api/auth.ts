import * as basicAuth from "basic-auth";

const USER = process.env.API_BASIC_USER;
const PASS = process.env.API_BASIC_PASS;

const unauthorized = (res) => {
  res.set("WWW-Authenticate", "Basic realm=Authorization Required");
  return res.send(401);
};

export const authMiddleware = (req, res, next) => {
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
