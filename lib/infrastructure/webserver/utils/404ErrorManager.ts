import { NextFunction, Request, Response } from 'express';

export default (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const err = new Error('Not found');
    err.name = 'NOT_FOUND';
    next(err);
  } catch (error) {
    next(error);
  }
};
