import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {

  private apiUrl = environment.backendURL; // Update with your API URL

  constructor(private http: HttpClient) {}

  getAffiliateCount(referralCode: string) {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count-affiliates`, {
      params: { referralCode }
    });
  }
}
