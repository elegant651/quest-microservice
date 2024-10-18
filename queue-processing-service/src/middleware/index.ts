import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils";

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode
    const message = error.message;
    error = new ApiError(statusCode, message, false, err.stack.toString());
  }
  next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message
  };

  console.error(err);

  res.status(statusCode).json(response);
  next();
};
