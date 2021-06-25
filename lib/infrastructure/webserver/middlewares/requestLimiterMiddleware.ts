import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../logger';

export default () => {
  const opts = {
    points: 30, // Number of points
    duration: 1, // Per second(s)
    blockDuration: 60,
  };
  const rateLimiter = new RateLimiterMemory(opts);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (error) {
      logger.error(`Muchas peticiones desde una ip ${req.ip}`);
      res.status(429).json({
        error: true,
        message: 'Too many requests',
      });
    }
  };
};
