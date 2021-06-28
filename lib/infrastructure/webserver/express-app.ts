import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { AppContext } from '../../domain/types/appContext';

import requestLimiter from './middlewares/requestLimiterMiddleware';
import routesLoader from './routes-loader';

import appErrorManager from './utils/appErrorManager';
import error404Manager from './utils/404ErrorManager';

function getApp(appContext: AppContext) {
  const app = express();

  const defaultDirectives  = helmet.contentSecurityPolicy.getDefaultDirectives();
  delete defaultDirectives['upgrade-insecure-requests'];

  /** Global Middlewares */
  app.use(
    helmet({
      frameguard: { action: 'deny' },
      contentSecurityPolicy: {
        directives: defaultDirectives
      }
    }),
  );

  app.use(hpp());
  app.use(cors());
  app.use(requestLimiter()); // Limitar peticiones

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.url === '/favicon.ico') {
      return res.status(204).send();
    }
    next();
  });

  app.use('/public', express.static(path.join(__dirname, '..', '..', 'public')));

  /** Routes */
  app.use('/', routesLoader(appContext));

  /** 404 errors */
  app.use(error404Manager);

  /** Manejo de errores */
  app.use(appErrorManager);

  return app;
}

export default getApp;
