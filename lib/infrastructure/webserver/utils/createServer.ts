import fs from 'fs';
import path from 'path';

import { Server } from 'net';
import environment from '../../config/environment';
import { Express } from 'express';

async function getServer(app: Express) {
  let server: Server;

  if (environment.server.HTTPS === true) {
    const https = await import('https');

    server = https.createServer(
      {
        key: fs.readFileSync(path.join(environment.server.KEY)),
        cert: fs.readFileSync(path.join(environment.server.CERT)),
      },
      app,
    );
  } else {
    const http = await import('http');
    server = http.createServer(app);
  }

  return server;
}

export default getServer;
