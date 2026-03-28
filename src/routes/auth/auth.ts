import { expressjwt as jwt } from 'express-jwt';
import * as express from 'express';

const getTokenFromHeaders = (req: express.Request): string | undefined => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return undefined;
  }

  const [scheme, token] = authHeader.split(' ');
  if ((scheme === 'Token' || scheme === 'Bearer') && token) {
    return token;
  }

  return undefined;
};

const auth = {
  required: jwt({
    secret: process.env.JWT_SECRET || "superSecret",
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET || "superSecret",
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};

export default auth;
