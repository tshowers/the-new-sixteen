import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, getDocs, updateDoc, deleteDoc, DocumentData, query, where, orderBy, startAfter, limit, getDoc } from '@angular/fire/firestore';
import { Auth, updateProfile, updateEmail, GoogleAuthProvider, OAuthProvider, signInWithRedirect, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, ActionCodeSettings, authState, signOut, User } from '@angular/fire/auth';
import { ENDPOINTS } from './endpoints';  // Make sure the path is correct
import { Observable, BehaviorSubject, map, catchError, from, of } from 'rxjs';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';
import { Contact } from '../shared/data/interfaces/contact.model';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private statusSubject = new BehaviorSubject<string>('');
    status$: Observable<string> = this.statusSubject.asObservable();

    private lastVisible: DocumentData | null = null;
    private events = new BehaviorSubject<any[]>([]);
    events$ = this.events.asObservable();

    constructor(private firestore: Firestore, private logger: LoggerService, private auth: Auth,) { }

    // Existing methods remain unchanged
    getRealtimeData(endpointKey: keyof typeof ENDPOINTS, user: string): Observable<any[]> {
        if (environment.multiTenant) {
            return this.getTenantRealtimeData(endpointKey, user);
        } else {
            this.logger.info("Getting data", ENDPOINTS[endpointKey])
            const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
            this.logEvent(`${user} started a real-time data subscription to ${ENDPOINTS[endpointKey]}`, user);
            return collectionData(ref, { idField: 'id' }).pipe(
                map((docs: any[]) => docs.map(doc => ({
                    ...doc,
                    id: doc.id
                })))
            ) as Observable<any[]>;
        }
    }

    getCollectionData(endpointKey: keyof typeof ENDPOINTS, user: string) {
        if (environment.multiTenant) {
            return this.getTenantCollectionData(endpointKey, user);
        } else {
            this.logger.info("Attempting to retrieve", ENDPOINTS[endpointKey])
            const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
            return getDocs(ref)
                .then(snapshot => {
                    // this.logger.log("Snapshot", JSON.stringify(snapshot));
                    this.logEvent(`${user} fetched documents from ${ENDPOINTS[endpointKey]}`, user);
                    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    return data;
                })
                .catch(error => {
                    this.logger.error("Error fetching documents:", error);
                    this.logEvent(`${user} failed to fetch documents from ${ENDPOINTS[endpointKey]} due to ${error}`, user);
                    throw new Error(error);
                });
        }
    }

    addDocument(endpointKey: keyof typeof ENDPOINTS, data: any, user: string) {
        if (environment.multiTenant) {
            return this.addTenantDocument(endpointKey, data, user);
        } else {
            this.setRecordState(data);
            this.logger.info("Adding data", ENDPOINTS[endpointKey])
            const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
            return addDoc(ref, data)
                .then(docRef => {
                    this.logEvent(`${user} added a new document to ${ENDPOINTS[endpointKey]}`, user);
                    const docId = docRef.id;
                    const updatedData = { ...data, id: docId };
                    return this.updateDocument(endpointKey, docId, updatedData, user)
                        .then(() => docId);
                })
                .catch(error => {
                    this.logger.error("Error adding document:", error);
                    this.logEvent(`${user} failed to add document to ${ENDPOINTS[endpointKey]} due to ${error}`, user);
                    throw error;
                });
        }
    }

    updateDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string) {
        if (environment.multiTenant) {
            return this.updateTenantDocument(endpointKey, id, data, user);
        } else {
            this.setRecordState(data);
            this.logger.info("Upating data", ENDPOINTS[endpointKey], id)

            const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
            return updateDoc(docRef, data).then(() => {
                this.logEvent(`${user} updated a document in ${ENDPOINTS[endpointKey]}`, user);
                return { success: true, id: id };
            }).catch(error => {
                this.logger.error("Error updating document:", error);
                this.logEvent(`${user} failed to update document in ${ENDPOINTS[endpointKey]} due to ${error}`, user);
                throw new Error(`Update failed: ${error}`);
            });
        }
    }

    deleteDocument(endpointKey: keyof typeof ENDPOINTS, id: string, user: string) {
        if (environment.multiTenant) {
            return this.deleteTenantDocument(endpointKey, id, user);
        } else {
            this.logger.info(`Document with ID ${id} attempted deletion.`, ENDPOINTS[endpointKey]);
            const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
            return deleteDoc(docRef).then(() => {
                this.logEvent(`${user} deleted a document in ${ENDPOINTS[endpointKey]}`, user);
                return { success: true, id: id };
            }).catch(error => {
                this.logger.error("Error deleting document:", error);
                this.logEvent(`${user} failed to delete document in ${ENDPOINTS[endpointKey]} due to ${error}`, user);
                throw new Error(`Delete failed: ${error}`);
            });
        }
    }

    /************************************** Multi-tenant methods ******************************************************/

    private getTenantRealtimeData(endpointKey: keyof typeof ENDPOINTS, user: string): Observable<any[]> {
        const tenantId = this.getTenantId();
        this.logger.info("Get Realtime Data", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`)
        const ref = collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        this.logEvent(`${user} started a real-time data subscription to tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
        return collectionData(ref, { idField: 'id' }).pipe(
            map((docs: any[]) => docs.map(doc => ({
                ...doc,
                id: doc.id
            })))
        ) as Observable<any[]>;
    }

    private getTenantCollectionData(endpointKey: keyof typeof ENDPOINTS, user: string) {
        const tenantId = this.getTenantId();
        this.logger.info("Get Tennat Collection", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`)
        const ref = collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        return getDocs(ref)
            .then(snapshot => {
                // this.logger.info("Snapshot", JSON.stringify(snapshot));
                this.logEvent(`${user} fetched documents from tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
                const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                return data;
            })
            .catch(error => {
                this.logger.error("Error fetching documents:", error);
                this.logEvent(`${user} failed to fetch documents from tenants/${tenantId}/${ENDPOINTS[endpointKey]} due to ${error}`, user);
                throw new Error(error);
            });
    }

    private addTenantDocument(endpointKey: keyof typeof ENDPOINTS, data: any, user: string) {
        this.setRecordState(data);
        const tenantId = this.getTenantId();
        this.logger.info("Adding Tennat Document", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`)
        const ref = collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        return addDoc(ref, data)
            .then(docRef => {
                this.logEvent(`${user} added a new document to tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
                const docId = docRef.id;
                const updatedData = { ...data, id: docId };
                return this.updateTenantDocument(endpointKey, docId, updatedData, user)
                    .then(() => docId);
            })
            .catch(error => {
                this.logger.error("Error adding document:", error);
                this.logEvent(`${user} failed to add document to tenants/${tenantId}/${ENDPOINTS[endpointKey]} due to ${error}`, user);
                throw error;
            });
    }

    addKnownTenantDocument(endpointKey: keyof typeof ENDPOINTS, data: any, user: string, tenantID: string) {
        this.setRecordState(data, true);
        const tenantId = tenantID;
        this.logger.info("Adding Tennat Document", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`)
        const ref = collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        return addDoc(ref, data)
            .then(docRef => {
                const docId = docRef.id;
                const updatedData = { ...data, id: docId };
                return this.updateKnowTenantDocument(endpointKey, docId, updatedData, user, tenantId)
                    .then(() => docId);
            })
            .catch(error => {
                this.logger.error("Error adding document:", error);
                throw error;
            });

    }

    private updateKnowTenantDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string, tenantId: string) {
        this.logger.info("Updating Tennat Document", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id)
        const docRef = doc(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id);
        return updateDoc(docRef, data).then(() => {
            return { success: true, id: id };
        }).catch(error => {
            this.logger.error("Error updating document:", error);
            throw new Error(`Update failed: ${error}`);
        });
    }

    private updateTenantDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string) {
        this.setRecordState(data);
        const tenantId = this.getTenantId();
        this.logger.info("Updating Tennat Document", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id)
        const docRef = doc(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id);
        return updateDoc(docRef, data).then(() => {
            this.logEvent(`${user} updated a document in tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
            return { success: true, id: id };
        }).catch(error => {
            this.logger.error("Error updating document:", error);
            this.logEvent(`${user} failed to update document in tenants/${tenantId}/${ENDPOINTS[endpointKey]} due to ${error}`, user);
            throw new Error(`Update failed: ${error}`);
        });
    }

    private deleteTenantDocument(endpointKey: keyof typeof ENDPOINTS, id: string, user: string) {
        const tenantId = this.getTenantId();
        this.logger.info(`Document with ID ${id} attempted deletion in tenant`, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        const docRef = doc(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id);
        return deleteDoc(docRef).then(() => {
            this.logEvent(`${user} deleted a document in tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
            return { success: true, id: id };
        }).catch(error => {
            this.logger.error("Error deleting document:", error);
            this.logEvent(`${user} failed to delete document in tenants/${tenantId}/${ENDPOINTS[endpointKey]} due to ${error}`, user);
            throw new Error(`Delete failed: ${error}`);
        });
    }


    getDropdownData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
        try {
            const ref = this.getCollectionRef(endpointKey);
            return collectionData(ref, { idField: 'id' }).pipe(
                catchError(error => {
                    this.logger.error(`Error retrieving data for endpoint ${ENDPOINTS[endpointKey]}:`, error);
                    throw new Error(`${ENDPOINTS[endpointKey]} Dropdown retrieval failed: ${error.message}`);
                })
            );
        } catch (error) {
            this.logger.error(`Error initializing data retrieval for endpoint ${ENDPOINTS[endpointKey]}:`, error);
            throw new Error(`${ENDPOINTS[endpointKey]} Dropdown initialization failed: ${error}`);
        }
    }

    public logEvent(action: string, user: string) {
        try {
            const logEntry = {
                action: action,
                user: user,
                timestamp: new Date() // Use server timestamp for consistency
            };
            this.logger.log("Logging event", logEntry);

            const logRef = this.getLogCollectionRef('auditLogs');
            addDoc(logRef, logEntry)
                .then(docRef => {
                    this.events.next([...this.events.value, logEntry]);
                })
                .catch(error => {
                    this.logger.error('Error logging event:', error);
                });
        } catch (error) {
            this.logger.error('Error logging event:', error);
        }
    }

    private getCollectionRef(endpointKey: keyof typeof ENDPOINTS) {
        if (environment.multiTenant) {
            const tenantId = this.getTenantId();
            this.logger.info("Get Collection Ref", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`)
            return collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        } else {
            this.logger.info("Get Collection Ref", ENDPOINTS[endpointKey])
            return collection(this.firestore, ENDPOINTS[endpointKey]);
        }
    }

    private getLogCollectionRef(collectionName: string) {


        if (environment.multiTenant) {
            const tenantId = this.getTenantId();
            this.logger.info("Log Collection Ref", `tenants/${tenantId}/${collectionName}`)
            return collection(this.firestore, `tenants/${tenantId}/${collectionName}`);
        } else {
            this.logger.info("Log Collection Ref", collectionName)
            return collection(this.firestore, collectionName);
        }
    }

    async fetchData(pageSize: number, endpointKey: keyof typeof ENDPOINTS, id: string): Promise<any[]> {
        const colRef = this.getCollectionRef(endpointKey);
        const q = this.lastVisible
            ? query(colRef, orderBy('lastName'), startAfter(this.lastVisible), limit(pageSize))
            : query(colRef, orderBy('lastName'), limit(pageSize));

        const documentSnapshots = await getDocs(q);

        // Capture the last visible document
        this.lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

        // Map documents to data including the document ID
        return documentSnapshots.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    }


    resetPagination() {
        this.lastVisible = null;
    }


    async uploadData(data: Contact[], message: string) {
        if (environment.multiTenant) {
            return this.uploadMultiTenantData(data, message);
        } else {
            return this.uploadSingleTenantData(data, message);
        }
    }

    private async uploadSingleTenantData(data: Contact[], message: string) {
        const ref = collection(this.firestore, 'contacts');
        this.logger.info("Upldate Data", 'contacts');
        let successCount = 0;
        let failureCount = 0;
        let skippedCount = 0;  // Count for duplicates or no email cases

        for (const item of data) {
            try {
                // Ensure there is at least one email address and it's not undefined
                if (item.emailAddresses && item.emailAddresses.length > 0 && item.emailAddresses[0].emailAddress) {
                    item.email = item.emailAddresses[0].emailAddress.toLowerCase();
                    const exists = await this.checkIfExists(item.emailAddresses[0].emailAddress);
                    if (!exists) {
                        await addDoc(ref, item);
                        successCount++;
                        this.logger.info(`Document ${successCount} added successfully`);
                        this.setStatus(`Document ${successCount} added successfully.`);
                    } else {
                        skippedCount++;
                        this.logger.info(`Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`);
                        this.setStatus(`Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`);
                    }
                } else {
                    // Handle cases where there is no email address
                    this.logger.info('No valid email found, skipping document.', item);
                    this.setStatus('No valid email found, skipping document.');
                    skippedCount++;
                }
            } catch (error) {
                this.logger.error(`Error adding document: ${JSON.stringify(item)}, error: ${error}`);
                this.setStatus(`Error adding document: ${JSON.stringify(item)}, error: ${error}`);
                failureCount++;
            }
        }

        this.logger.info(`Upload Summary: ${successCount} records added successfully, ${failureCount} records failed, ${skippedCount} records skipped.`);
        this.setStatus(`Upload Summary: ${successCount} records added successfully, ${failureCount} records failed, ${skippedCount} records skipped.`);
        return { successCount, failureCount, skippedCount };
    }

    private async uploadMultiTenantData(data: Contact[], message: string) {
        const tenantId = this.getTenantId();
        this.logger.info("Upload Tenenat Data ", `tenants/${tenantId}/contacts`);
        const ref = collection(this.firestore, `tenants/${tenantId}/contacts`);
        let successCount = 0;
        let failureCount = 0;
        let skippedCount = 0;  // Count for duplicates or no email cases

        for (const item of data) {
            try {
                // Ensure there is at least one email address and it's not undefined
                if (item.emailAddresses && item.emailAddresses.length > 0 && item.emailAddresses[0].emailAddress) {
                    item.email = item.emailAddresses[0].emailAddress.toLowerCase();
                    const exists = await this.checkIfExists(item.emailAddresses[0].emailAddress, tenantId);
                    if (!exists) {
                        await addDoc(ref, item);
                        successCount++;
                        this.logger.info('Document ' + successCount + ' added successfully');
                        message = 'Document ' + successCount + ' added successfully.';
                    } else {
                        this.logger.info(`Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`);
                        message = `Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`;
                        skippedCount++;
                    }
                } else {
                    // Handle cases where there is no email address
                    this.logger.info('No valid email found, skipping document.', item);
                    message = 'No valid email found, skipping document.', item;
                    skippedCount++;
                }
            } catch (error) {
                this.logger.error(`Error adding document: ${JSON.stringify(item)}, error: ${error}`);
                message = `Error adding document: ${JSON.stringify(item)}, error: ${error}`;
                failureCount++;
            }
        }

        this.logger.info(`Upload Summary: ${successCount} records added successfully, ${failureCount} records failed, ${skippedCount} records skipped.`);
        return { successCount, failureCount, skippedCount };
    }

    // Helper method to check if a document exists by email address
    private async checkIfExists(email: string, tenantId?: string): Promise<boolean> {
        this.logger.info("checking to see if " + email + " already exists");
        if (!email) {
            this.logger.warn("checkIfExists called with no email provided.");
            return false;
        }


        let ref;

        if (tenantId) {
            this.logger.info("Check if Email prosent from ", `tenants/${tenantId}/contacts`);
            ref = collection(this.firestore, `tenants/${tenantId}/contacts`);
        } else {
            this.logger.info("Check if Email prosent from ", `contacts`);
            ref = collection(this.firestore, 'contacts');
        }
        const q = query(ref, where('email', '==', email));
        // const snapshot = await getDocs(q);

        try {
            this.logger.info(`Executing query for email: ${email}`);
            const querySnapshot = await getDocs(q);
            this.logger.info(`Query results:`, querySnapshot.docs.map(doc => doc.data()));
            this.logger.info(`Query executed. Found ${querySnapshot.size} documents matching email: ${email}`);
            const exists = !querySnapshot.empty;
            this.logger.info(`Email ${email} existence check: ${exists ? 'Exists' : 'Does not exist'}.`);
            return exists;

        } catch (error) {
            this.logger.error(`Error executing query for email ${email}: ${error}`);
            return false; // Assume email does not exist if there's a failure in the query

        }

    }

    setRecordState(data: any, bypass?: boolean): void {
        if (!data.id) {
            data.dateAdded = new Date().toISOString();
        }
        data.lastUpdated = new Date().toISOString();
        data.lastViewed = new Date().toISOString();
        data.timeStamp = new Date();
        if (environment.multiTenant && !bypass) {
            data.tenantId = this.getTenantId();
        }
    }



    getDocument(endpointKey: keyof typeof ENDPOINTS, id: string, user: string): Observable<any> {
        let path: string;
        if (environment.multiTenant) {
            const tenantId = this.getTenantId();
            path = `tenants/${tenantId}/${ENDPOINTS[endpointKey]}/${id}`;
        } else {
            path = `${ENDPOINTS[endpointKey]}/${id}`;
        }
        const docRef = doc(this.firestore, path);
        return from(getDoc(docRef)).pipe(
            map(docSnapshot => {
                if (docSnapshot.exists()) {
                    return { id: docSnapshot.id, ...docSnapshot.data() };
                } else {
                    return null;
                }
            }),
            catchError(error => {
                this.logger.error("Error fetching document:", error);
                return of(null);
            })
        );
    }

    getTenantId(): string {
        const user = this.auth.currentUser; // Directly access the current user
        if (!user) {
            throw new Error('User is not authenticated');
        }
        return user.uid; // Return the UID if the user is logged in
    }

    private setStatus(message: string) {
        this.statusSubject.next(message);
    }
}
