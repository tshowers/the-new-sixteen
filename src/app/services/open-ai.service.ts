import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ENDPOINTS } from './endpoints';
import { Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {


  constructor(private http: HttpClient, private logger: LoggerService, private dataService: DataService) { }

  getAIResponse(prompt: string, user: string): Observable<any> {
    this.logger.log("Calling", `${environment.backendURL}/openai`, "With this message", JSON.stringify(prompt));
    this.dataService.logEvent('Calling OpenAI getAIResponse', user); // Log event
    return this.http.post<any>(`${environment.backendURL}/openai`, { prompt: prompt });
  }

  getAIParsedQuery(query: string, user: string): Observable<any> {
    this.logger.log("Calling", `${environment.backendURL}/parse-query`, "With this message", JSON.stringify(query));
    this.dataService.logEvent('Calling OpenAI getAIParsedQuery', user); // Log event
    return this.http.post<any>(`${environment.backendURL}/parse-query`, { query: query });
  }

}
