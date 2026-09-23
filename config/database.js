import mongoose from 'mongoose';

const attachDatabaseListeners = () => {
  mongoose.connection.on('error', (error) => {
    // Database connection strings can contain credentials, so never log the URI.
    console.error(`MongoDB runtime error (${error.name}).`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB reconnected.');
  });
};

let listenersAttached = false;

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!listenersAttached) {
    attachDatabaseListeners();
    listenersAttached = true;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    });

    console.info(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed (${error.name}). Check database availability and configuration.`);
    throw error;
  }
};

export const disconnectDatabase = () => mongoose.disconnect();
