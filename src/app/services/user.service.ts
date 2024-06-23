import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, query, where, doc, setDoc, updateDoc, docData, getDoc } from '@angular/fire/firestore';
import { Auth, User } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { Contact, EmailAddress } from '../shared/data/interfaces/contact.model';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedInContactInfo: Contact | null = null;

  constructor(private firestore: Firestore, private auth: Auth, private logger: LoggerService) { }

  /*******************************Multi Tenant ********************************************************/

  private findTenantContactById(tenantId: string, userId: string): Observable<Contact | null> {
    const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${userId}`);
    this.logger.info("Find Tenant Contact", `tenants/${tenantId}/contacts/${userId}`)
    return from(getDoc(contactRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return docSnapshot.data() as Contact;
        } else {
          return null;
        }
      })
    );
  }

  getTenantLoggedInContactInfo(): Observable<Contact | null> {
    if (this.loggedInContactInfo) {
      this.logger.info("getTenantLoggedInContactInfo - Returning Tenant Logged In Contact", this.loggedInContactInfo)
      return of(this.loggedInContactInfo);
    } else {
      const user = this.auth.currentUser;
      this.logger.info("getTenantLoggedInContactInfo - Figuring out Contact record of logged in user");
      if (!user) {
        return throwError(() => new Error('No user logged in'));
      }

      const tenantId = user.uid;
      return this.findTenantContactById(tenantId, user.uid).pipe(
        switchMap(contact => {
          if (contact) {
            this.logger.info("getTenantLoggedInContactInfo - Contact Found", contact)
            this.loggedInContactInfo = contact;
            return of(this.loggedInContactInfo);
          } else {
            this.logger.info("Contact Not Found");
            const newContact: Contact = {
              firstName: '',
              lastName: '',
              id: user.uid,
              email: user.email ?? '',
              tenantId: tenantId, 
              loginID: user.uid, 
              dateAdded: new Date().toISOString(), 
              timeStamp: new Date()
              // Add other contact fields as needed
            };
            this.logger.info("Get Tenant Logged In Contact Info", `tenants/${tenantId}/contacts/${user.uid}`);
            const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${user.uid}`);
            return from(setDoc(contactRef, newContact)).pipe(
              map(() => {
                this.loggedInContactInfo = newContact;
                return newContact;
              }),
              catchError(error => {
                this.logger.error('Error creating new tenant contact:', error);
                return of(null);
              })
            );
          }
        }),
        catchError(error => {
          this.logger.error('Error getting logged in tenant contact info:', error);
          return of(null);
        })
      );
    }
  }

  findTenantCreateContact(tenantId: string, userId: string, email: string): Observable<Contact> {
    const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${userId}`);
    this.logger.info("Find Tenant and Create Contact", `tenants/${tenantId}/contacts/${userId}`)
    return from(getDoc(contactRef)).pipe(
      switchMap(docSnapshot => {
        if (docSnapshot.exists()) {
          // Return the existing contact if it exists
          this.logger.info("findTenantCreateContact - Document Exists")
          const contact = docSnapshot.data() as Contact;
          return of(contact);
        } else {
          this.logger.info("findTenantCreateContact -Creating from scratch")
          // Create a new contact if none exists
          const newContact: Contact = {
            id: userId,
            email: email,
            // Add other contact fields as needed
            emailAddresses: [{ emailAddress: email, emailAddressType: 'primary', blocked: false }],
            firstName: '',
            middleName: '',
            lastName: '',
            subscriber: true,
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
            type: 'subscriber', 
            interactions: [],
            acquisitionSource: 'sign-up',
            dateAdded: new Date().toISOString(),
            lastContacted: new Date().toISOString()
          };
          // Set the new contact document in Firestore and return the contact
          return from(setDoc(contactRef, newContact)).pipe(
            map(() => {
              this.loggedInContactInfo = newContact;
              return newContact;
            }),
            catchError(error => {
              throw new Error(`Failed to create contact: ${error}`);
            })
          );
        }
      }),
      catchError(error => {
        throw new Error(`Failed to find or create tenant contact: ${error}`);
      })
    );
  }



  findAffiliateCreateContact(tenantId: string, userId: string, email: string): Observable<Contact> {
    const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${userId}`);
    this.logger.info("Find Tenant and Create Contact", `tenants/${tenantId}/contacts/${userId}`)
    return from(getDoc(contactRef)).pipe(
      switchMap(docSnapshot => {
        if (docSnapshot.exists()) {
          // Return the existing contact if it exists
          const contact = docSnapshot.data() as Contact;
          return of(contact);
        } else {
          // Create a new contact if none exists
          const newContact: Contact = {
            id: userId,
            email: email,
            // Add other contact fields as needed
            emailAddresses: [{ emailAddress: email, emailAddressType: 'primary', blocked: false }],
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
            type: 'affiliate', 
            acquisitionSource: 'affiliate',
            dateAdded: new Date().toISOString(),
            lastContacted: new Date().toISOString()
          };
          // Set the new contact document in Firestore and return the contact
          return from(setDoc(contactRef, newContact)).pipe(
            map(() => {
              this.loggedInContactInfo = newContact;
              return newContact;
            }),
            catchError(error => {
              throw new Error(`Failed to create contact: ${error}`);
            })
          );
        }
      }),
      catchError(error => {
        throw new Error(`Failed to find or create tenant contact: ${error}`);
      })
    );
  }
  
 
  


  /*******************************Single Tenant ********************************************************/

  private findContactById(userId: string): Observable<Contact[]> {
    const contactsRef = collection(this.firestore, 'contacts');
    this.logger.info("Find Contact By ID", "contacts", userId)
    const q = query(contactsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Contact[]>;
  }

  findOrCreateContact(userId: string, email: string): Observable<Contact> {
    if (environment.multiTenant) {
      const tenantId = userId; // Assume tenantId is the same as userId
      return this.findTenantCreateContact(tenantId, userId, email);
    } else {
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
            this.logger.info("Find or Create Contact", userId );
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

    
  }

  updateContact(contact: Contact): Observable<void> {
    const user = this.auth.currentUser;

    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    // Check if contact.id is set, otherwise use the user's UID
    if (!contact.id) {
      contact.id = user.uid;
    }

    const path = environment.multiTenant
      ? `tenants/${contact.tenantId}/contacts/${contact.id}`
      : `contacts/${contact.id}`;

    this.logger.info("Update Contact Path:", path);

    const contactDocRef = doc(this.firestore, path);

    return from(updateDoc(contactDocRef, { ...contact })).pipe(
      catchError(error => {
        this.logger.error("Failed to update contact:", error);
        throw new Error(`Failed to update contact: ${error.message}`);
      })
    );
  }

  setLoggedInContactInfo(contact: Contact): void {
    this.loggedInContactInfo = contact;
  }

    getLoggedInContactInfo(): Observable<Contact | null> {
    if (environment.multiTenant) {
      this.logger.info("getLoggedInContactInfo for tenant")
      return this.getTenantLoggedInContactInfo();
    }
    else { 
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
            this.logger.error('Error getting logged in contact info:', error);
            return of(null);
          })
        );
      }
    }

  }

}
