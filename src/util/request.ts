/* eslint-disable @typescript-eslint/no-empty-interface */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestConfig extends AxiosRequestConfig {}
export interface Response<T = unknown> extends AxiosResponse<T> {}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestError(error: unknown): boolean {
    return !!(error as AxiosError).response?.status;
  }
}
