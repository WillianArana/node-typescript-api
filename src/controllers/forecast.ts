import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import getDecoded from '@src/util/get-decoded';
import { Request, Response } from 'express';
import { BaseController } from '.';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForgeLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const decoded = getDecoded(req);
      const beaches = await Beach.find({ user: decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error);
      this.sendErrorResponse(res, { code: 500, message: 'Something went wrong' });
    }
  }
}
