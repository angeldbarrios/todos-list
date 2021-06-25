import express from 'express';
import { AppContext } from '../../../domain/types/appContext';
import todoController from './todoController';

export default (appContext: AppContext): express.Router => {
  const router = express.Router();
  router.use('/todo', todoController(appContext));

  return router;
};
