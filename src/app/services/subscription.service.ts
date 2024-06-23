import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  apiUrl = environment.backendURL;

  constructor(private http: HttpClient, private logger: LoggerService) {}

  getSubscriptionStatus(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscription-status?userId=${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  cancelSubscription(subscriptionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel-subscription`, { subscriptionId }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please try again later.';
      } else {
        errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      }
    }
    this.logger.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
