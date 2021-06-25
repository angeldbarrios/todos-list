import { NextFunction, Request, Response } from 'express';
import logger from '../logger';

const errorMapping = {
  BAD_DATA: ({ ip, url, err }) => {
    logger.error(`BAD DATA > IP:[${ip}] URL:[${url}] - ${err.message}`);
    return {
      status: 400,
      message: err.message || 'Bad data',
    };
  },

  NOT_FOUND: ({ ip, url, err }) => {
    logger.error(`NOT FOUND > IP:[${ip}] URL:[${url}] - ${err.message}`);
    return {
      status: 404,
      message: err.message || 'Not found',
    };
  },
};

export default (err: Error, req: Request, res: Response, _next: NextFunction) => {
  try {
    const errHandler = errorMapping[err.name];

    if (errHandler) {
      const { status, message } = errHandler({ ip: req.ip, url: req.url, err });
      res.status(status).json({ error: true, message: message });
      return;
    }

    res.status(500).json({
      error: true,
      message: err.stack, // for debug only
    });
  } catch (error) {
    logger.error(`IP:[${req.ip}] URL:[${req.url}] - ${err.stack}`);
    res.status(500).json({
      error: true,
      message: err.stack, // for debug only
    });
  }
};
