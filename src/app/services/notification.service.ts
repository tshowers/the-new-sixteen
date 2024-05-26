import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private newMessageSubject = new BehaviorSubject<boolean>(false);
  newMessage$ = this.newMessageSubject.asObservable();

  notifyNewMessage() {
    this.newMessageSubject.next(true);
  }

  clearNotification() {
    this.newMessageSubject.next(false);
  }
}
