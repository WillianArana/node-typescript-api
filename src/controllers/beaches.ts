import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import getDecoded from '@src/util/get-decoded';
import { Request, Response } from 'express';

import { BaseController } from '.';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const decoded = getDecoded(req);
      const beach = new Beach({ ...req.body, ...{ user: decoded?.id } });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error as Error);
    }
  }
}
