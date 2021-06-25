import express from 'express';
import { AppContext } from '../../domain/types/appContext';
import v1Controller from '../../interfaces/controllers/v1/v1Loader';
import renderController from '../../interfaces/controllers/v1/renderController';

export default (appContext: AppContext) => {
  const app = express.Router();
  app.use('/api/v1', v1Controller(appContext));
  app.use('/app', renderController());
  return app;
};
