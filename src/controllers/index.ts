import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(clientErrors);
    } else {
      res.status(500).send({ code: 500, error: 'Something went wrong!' });
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
    return { code: 422, error: error.message };
  }
}
