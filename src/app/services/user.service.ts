import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, query, where, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Contact, EmailAddress } from '../shared/data/interfaces/contact.model';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedInContactInfo: Contact | null = null;

  constructor(private firestore: Firestore) {}

  findContactByEmail(email: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    const q = query(contactsRef, where('emailAddresses.emailAddress', 'array-contains', email));
    return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
  }

  findOrCreateContact(email: string, userId: string): Observable<Contact> {
    return this.findContactByEmail(email).pipe(
      switchMap(contacts => {
        if (contacts.length > 0) {
          const contact = contacts[0]; // Take the first matching contact
          if (!contact.userId) {
            // If there's no userId, update the document
            const contactDocRef = doc(this.firestore, `contacts/${contact.id}`);
            return updateDoc(contactDocRef, { userId: userId }).then(() => {
              return { ...contact, userId: userId };
            });
          }
          return of(contact); // Return the contact if it already has a userId
        } else {
          // Create a new contact if none exists
          const newContact: Contact = {
            emailAddresses: [{ emailAddress: email, emailAddressType: 'primary', blocked: false }],
            userId: userId,
            firstName: '',
            middleName: '',
            lastName: '',
            images: [{
              src: 'assets/nophoto.jpg',
              alt: 'No photo available'
            }],
            company: {  // Add default company object here
              name: '',  // Default empty name
              numberOfEmployees: '', // Default value can be empty or a placeholder
              other: '', // Default or initial value
              phoneNumbers: [], // Initialize as empty array
              emailAddresses: [], // Initialize as empty array
              addresses: [], // Initialize as empty array
              url: '', // Default or initial value
              sicCode: '', // Default or initial value
              status: '', // Default or initial value
              shared: false, // Default boolean value
              capabilities: []
            },
            // Default values for new properties
            connectionDetails: {
              startDate: new Date().toISOString(),  // Consider what default makes sense for your use case
              mutualConnections: 0,
              transactionHistory: []
            },
            engagements: [],
            interactions: [],
            acquisitionSource: 'web',
            dateAdded: new Date().toISOString(),
            lastContacted: new Date().toISOString()
          };
          const newContactRef = doc(collection(this.firestore, 'contacts'));
          return setDoc(newContactRef, newContact).then(() => {
            return { ...newContact, id: newContactRef.id };
          });
        }
      }),
      catchError(error => {
        throw new Error(`Failed to find or create contact: ${error}`);
      })
    );
  }

  setLoggedInContactInfo(contact: Contact): void {
    this.loggedInContactInfo = contact;
  }

  getLoggedInContactInfo(): Contact | null {
    return this.loggedInContactInfo;
  }

}
