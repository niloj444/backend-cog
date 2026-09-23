export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isDuplicateKeyError = error?.code === 11000;
  const statusCode = isDuplicateKeyError ? 409 : error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
  }
  return res.status(statusCode).json({
    success: false,
    message: isDuplicateKeyError ? 'An account with that email already exists' : statusCode === 500 ? 'Internal server error' : error.message,
  });
};
