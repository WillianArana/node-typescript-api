import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-error';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(beaches: Beach[]): Promise<BeachForecast[]> {
    try {
      const pointsWithCorrectSources: BeachForecast[] = [];
      for await (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData = this.enrichedBeachDate(points, beach);
        pointsWithCorrectSources.push(...enrichedBeachData);
      }

      return pointsWithCorrectSources;
    } catch (error) {
      const err = error as Error;
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
}
