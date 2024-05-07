import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contact } from '../shared/data/interfaces/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactSource = new BehaviorSubject<Contact | null>(null);
  currentContact = this.contactSource.asObservable();

  constructor() { }

  changeContact(contact: Contact) {
    this.contactSource.next(contact);
  }

  resetContact() {
    this.contactSource.next(null);  // Set the currentContact to null
  }
}
