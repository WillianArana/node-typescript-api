export class TimeUtil {
  static getUnixTimeForAFutureDay(days: number): number {
    const today = new Date();
    const futureDay = new Date();
    futureDay.setDate(today.getDate() + days);
    return futureDay.getTime();
  }
}
