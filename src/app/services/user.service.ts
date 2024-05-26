import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, query, where, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, User } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { Contact, EmailAddress } from '../shared/data/interfaces/contact.model';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedInContactInfo: Contact | null = null;

  constructor(private firestore: Firestore, private auth: Auth) { }

  /*******************************Multi Tenant ********************************************************/

  findTenantContactById(tenantId: string, userId: string): Observable<Contact[]> {
    // Reference the contacts collection for the specified tenant
    const contactsRef = collection(this.firestore, `tenants/${tenantId}/contacts`);
    // Query contacts by user ID within the tenant's contacts collection
    const q = query(contactsRef, where('userId', '==', userId));
    // Return an observable of the contact data
    return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
  }

  findTenantCreateContact(tenantId: string, userId: string, email: string): Observable<Contact> {
    return this.findTenantContactById(tenantId, userId).pipe(
      switchMap(contacts => {
        if (contacts.length > 0) {
          // Return the first matching contact if it exists
          const contact = contacts[0];
          return of(contact);
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
            company: {
              name: '',
              numberOfEmployees: '',
              other: '',
              phoneNumbers: [],
              emailAddresses: [],
              addresses: [],
              url: '',
              sicCode: '',
              status: '',
              shared: false,
              capabilities: []
            },
            connectionDetails: {
              startDate: new Date().toISOString(),
              mutualConnections: 0,
              transactionHistory: []
            },
            engagements: [],
            interactions: [],
            acquisitionSource: 'web',
            dateAdded: new Date().toISOString(),
            lastContacted: new Date().toISOString()
          };
          // Reference for the new contact document within the tenant's contacts collection
          const newContactRef = doc(collection(this.firestore, `tenants/${tenantId}/contacts`), userId);
          // Set the new contact document in Firestore and return the contact with its ID
          return from(setDoc(newContactRef, newContact)).pipe(
            map(() => ({ ...newContact, id: newContactRef.id }))
          );
        }
      }),
      catchError(error => {
        // Throw an error if the operation fails
        throw new Error(`Failed to find or create contact: ${error}`);
      })
    );
  }

  getTennatLoggedInContactInfo(): Observable<Contact | null> {
    if (this.loggedInContactInfo) {
      return of(this.loggedInContactInfo);
    } else {
      const user = this.auth.currentUser;

      if (!user) {
        return throwError(() => new Error('No user logged in'));
      }

      return this.findOrCreateContact(user.uid, user.email ?? '').pipe(
        map(contact => {
          this.loggedInContactInfo = contact;
          return contact;
        }),
        catchError(error => {
          console.error('Error getting logged in contact info:', error);
          return of(null);
        })
      );
    }
  }

  


  /*******************************Single Tenant ********************************************************/

  findContactById(userId: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    const q = query(contactsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
  }

  findOrCreateContact(userId: string, email: string): Observable<Contact> {
    return this.findContactById(userId).pipe(
      switchMap(contacts => {
        if (contacts.length > 0) {
          const contact = contacts[0]; // Take the first matching contact
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
          const newContactRef = doc(collection(this.firestore, 'contacts'), userId);
          return from(setDoc(newContactRef, newContact)).pipe(
            map(() => ({ ...newContact, id: newContactRef.id }))
          );
        }
      }),
      catchError(error => {
        throw new Error(`Failed to find or create contact: ${error}`);
      })
    );
  }

  updateContact(contact: Contact): Observable<void> {
    const contactDocRef = doc(this.firestore, `contacts/${contact.id}`);
    return from(updateDoc(contactDocRef, { ...contact }));
  }

  setLoggedInContactInfo(contact: Contact): void {
    this.loggedInContactInfo = contact;
  }

  getLoggedInContactInfo(): Observable<Contact | null> {
    if (this.loggedInContactInfo) {
      return of(this.loggedInContactInfo);
    } else {
      const user = this.auth.currentUser;

      if (!user) {
        return throwError(() => new Error('No user logged in'));
      }

      return this.findOrCreateContact(user.uid, user.email ?? '').pipe(
        map(contact => {
          this.loggedInContactInfo = contact;
          return contact;
        }),
        catchError(error => {
          console.error('Error getting logged in contact info:', error);
          return of(null);
        })
      );
    }
  }

}
