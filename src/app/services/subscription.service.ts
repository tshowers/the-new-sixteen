import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  apiUrl = environment.backendURL;

  constructor(private http: HttpClient) {}


  getSubscriptionStatus(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscription-status?userId=${userId}`);
  }

  cancelSubscription(subscriptionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel-subscription`, { subscriptionId });
  }
}
