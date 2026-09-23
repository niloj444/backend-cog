import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { validateEnvironment } from './config/env.js';
// import dotenv from "dotenv";

// dotenv.config();

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDatabase();

    const port = Number(process.env.PORT) || 5000;
    const server = app.listen(port);

    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    console.info(`API server listening on port ${port}.`);
  } catch (error) {
    console.error(`Server startup aborted: ${error.message}`);
    await disconnectDatabase();
    process.exit(1);
  }
};

startServer();
