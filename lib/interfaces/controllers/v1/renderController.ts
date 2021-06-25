import path from 'path';
import express, { NextFunction, Request, Response } from 'express';

export default (): express.Router => {
  const router = express.Router();

  /** It makes more sense this file is not here, elsewhere in controller folder
   * WE ARE INSIDE v1 FOLDER
   * TODO: take this file out
   */
  router.get('/', (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Rendering React app HTML
      const filePath = path.join(__dirname, '..', '..', '..', 'public', 'index.html');
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
