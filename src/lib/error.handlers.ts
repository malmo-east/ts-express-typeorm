import { Express, Request, Response, NextFunction } from 'express';
import { CustomExternalError, CustomInternalError } from '../domain/error/custom.errors';
import { logger } from './logger';
import { ErrorCode } from '../domain/error/error.code';

const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof CustomExternalError) {
    response.status(error.statusCode).json({ errors: error.messages });
  } else {
    if (error instanceof CustomInternalError) {
      logger.error(ErrorCode.INTERNAL_ERROR, {
        message: error.message,
        stack: error.stackArray,
      });
    }
    response.status(500).json({ message: ErrorCode.INTERNAL_ERROR });
  }
  next();
};

type AsyncFunc = (req: Request, resp: Response, next: NextFunction) => Promise<any>;

export const asyncHandler: (func: AsyncFunc) => AsyncFunc = func => (request, response, next) =>
  Promise.resolve(func(request, response, next)).catch((error: Error) =>
    errorHandler(error, request, response, next),
  );

export const syncHandler = (app: Express) => app.use(errorHandler);
