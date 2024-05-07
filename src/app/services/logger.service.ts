import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(message: any, ...optionalParams: any[]) {
    if (!environment.production) {
      console.log(message, ...optionalParams);
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (!environment.production) {
      console.error(message, ...optionalParams);
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (!environment.production) {
      console.warn(message, ...optionalParams);
    }
  }

  info(message: any, ...optionalParams: any[]) {
    if (!environment.production) {
      console.info(message, ...optionalParams);
    }
  }

  debug(message: any, ...optionalParams: any[]) {
    if (!environment.production) {
      console.debug(message, ...optionalParams);
    }
  }
}
