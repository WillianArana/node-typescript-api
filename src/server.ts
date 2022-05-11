import './util/molule-alias';

import { Server } from '@overnightjs/core';
import * as database from '@src/database';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Application } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import expressPino from 'express-pino-logger';
import swaggerUi from 'swagger-ui-express';

import apiSchema from './api-schema.json';
import { BeachesController } from './controllers/beaches';
import { ForecastController } from './controllers/forecast';
import { UsersController } from './controllers/users';
import logger from './logger';
import { apiErrorValidator } from './middlewares/api-error-validator';

export class SetupServer extends Server {
  constructor(protected readonly _port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(expressPino(logger));
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as OpenAPIV3.Document,
        validateRequests: false, //will be implemented in step2
        validateResponses: false, //will be implemented in step2
      })
    );
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([forecastController, beachesController, usersController]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this._port, () => {
      logger.info('Server listening of port: ' + this._port);
    });
  }
}
