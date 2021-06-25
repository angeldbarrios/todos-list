// import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();


import bootstrap from './lib/infrastructure/config/bootstrap';
import initServer from './lib/infrastructure/webserver/server';
import logger from './lib/infrastructure/webserver/logger';

process.on('uncaughtException', (error) => {
  console.error(`uncaughtException: ${error.stack}`);
  logger.error(`uncaughtException: ${error.name} >  ${error.stack}`);
  process.exit(-1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`unhandledRejection: ${reason}`);
  logger.error(`uncaughtException: ${reason}`);
  process.exit(-1);
});

// Start the server
const start = async () => {
  try {
    const appContext = await bootstrap.init();
    await initServer(appContext);
  } catch (err) {
    logger.error(`uncaughtException: ${err.name} >  ${err.stack}`);
    process.exit(1);
  }
};

start();