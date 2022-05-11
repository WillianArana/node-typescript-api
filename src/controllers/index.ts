import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import APiError, { APIError } from '@src/util/errors/api-error';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(
        APiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);
      res.status(500).send({ code: 500, message: 'Something went wrong!' });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const hasDuplicatedKindErrors = Object.values(error.errors).some(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (hasDuplicatedKindErrors) {
      return { code: 409, error: error.message };
    }
    return { code: 400, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(APiError.format(apiError));
  }
}
