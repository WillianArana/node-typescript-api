import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/util/errors/internal-error';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    try {
      const pointsWithCorrectSources: BeachForecast[] = [];
      for await (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData = this.enrichedBeachDate(points, beach);
        pointsWithCorrectSources.push(...enrichedBeachData);
      }

      return this.mapForecastByTime(pointsWithCorrectSources);
    } catch (error) {
      const err = error as Error;
      logger.error(err);
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private enrichedBeachDate(points: ForecastPoint[], beach: Beach): BeachForecast[] {
    return points.map((p) =>
      Object.assign(p, {
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1, // TODO need to be implemented
      })
    );
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
