import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TrialService {

  constructor() { }

  checkTrialStatus(contact: any): boolean {
    const dateAdded = new Date(contact.dateAdded);
    const lastPaymentReceived = contact.lastPaymentReceived ? new Date(contact.lastPaymentReceived) : null;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    if (!lastPaymentReceived) {
      // Check if within 30 days trial period
      return dateAdded > thirtyDaysAgo;
    } else {
      // Check if last payment received is outside of 30 days
      return lastPaymentReceived >= thirtyDaysAgo;
    }
  }
}
