import chalk from 'chalk';

import getApp from './express-app';
import createServer from './utils/createServer';

import { AppContext } from '../../domain/types/appContext';
import environment from '../config/environment';

async function initServer(appContext: AppContext) {
  const app = getApp(appContext);
  const port = environment.server.PORT || 3000;
  const server = await createServer(app);

  server.listen(port, () => {
    console.log(chalk.green(`Server listening on port: ${port}`));
  });

  return server;
}

export default initServer;
