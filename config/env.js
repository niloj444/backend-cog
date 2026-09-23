import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];

export const validateEnvironment = () => {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }
};


console.log(
  "MONGODB_URI being loaded:",
  process.env.MONGODB_URI?.replace(/\/\/.*?:.*?@/, "//***:***@")
);