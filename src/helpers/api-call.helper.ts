import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { RequestMethod, RequestOptions } from './helper.interfaces';


export async function wait(milliseconds = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
export async function withRetry<T extends (...args: any[]) => any>(operation: T, config = { retryTimes: 5, retryDelay: 3000 }): Promise<ReturnType<T>> {
  const retryTimes = config.retryTimes;
  const retryDelay = config.retryDelay;
  if (typeof operation !== 'function') return;
  return new Promise((resolve, reject) => {
    operation()
      .then(resolve)
      .catch((error) => {
        if (retryTimes > 0) {
          return wait(retryDelay)
            .then(() => withRetry.bind(null, operation, { retryTimes: retryTimes - 1, retryDelay }))
            .then(resolve)
            .catch(reject);
        }
        return reject(error);
      });
  });
}

@Injectable()
export class ApiCallHelper {
  constructor() {}
  call = async <T = any>(
    requestMethod: RequestMethod,
    url: string,
    headers: any | null,
    body: any | null,
    responseType?: string,
  ): Promise<AxiosResponse<T>> => {
    try {
  
      const options: RequestOptions | any = {
        method: requestMethod ? requestMethod : RequestMethod.GET,
        url: url,
        data: body,
      };
      options.headers = headers
        ? headers
        : { 'content-type': 'application/json',
             'Auth-Token': process.env.REPORT_API_KEY || "Kofj2lGvJXXT1P27y-qMqgpWyivbgtUpRMgZ2NQVbe7KjL21gvwKSSvWLIW3gCRDfYc"                     
      };
      if (responseType) options.responseType = responseType || 'stream';

      const a = axios(options);
      return a;
    } catch (err) {
      console.log(err);
      console.log(err?.response?.data);
      throw err;
    }
  };
}
