import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, getDocs, updateDoc, deleteDoc, DocumentData, query, where, orderBy, startAfter, limit } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';  // Make sure the path is correct
import { Observable, BehaviorSubject, map, catchError } from 'rxjs';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataService {


    private lastVisible: DocumentData | null = null;
    private events = new BehaviorSubject<any[]>([]);
    events$ = this.events.asObservable();

    constructor(private firestore: Firestore, private logger: LoggerService) { }

    // Existing methods remain unchanged
    getRealtimeData(endpointKey: keyof typeof ENDPOINTS, user: string): Observable<any[]> {
        if (environment.multiTenant) {
            return this.getTenantRealtimeData(endpointKey, user);
        } else {
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
            const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
            return getDocs(ref)
                .then(snapshot => {
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
            const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
            this.logger.log(`Document with ID ${id} attempted deletion.`);
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
        const ref = collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        return getDocs(ref)
            .then(snapshot => {
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
        const tenantId = this.getTenantId();
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

    private updateTenantDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string) {
        const tenantId = this.getTenantId();
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
        const docRef = doc(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, id);
        this.logger.log(`Document with ID ${id} attempted deletion in tenant ${tenantId}.`);
        return deleteDoc(docRef).then(() => {
            this.logEvent(`${user} deleted a document in tenants/${tenantId}/${ENDPOINTS[endpointKey]}`, user);
            return { success: true, id: id };
        }).catch(error => {
            this.logger.error("Error deleting document:", error);
            this.logEvent(`${user} failed to delete document in tenants/${tenantId}/${ENDPOINTS[endpointKey]} due to ${error}`, user);
            throw new Error(`Delete failed: ${error}`);
        });
    }

    // Helper method to get tenant ID (e.g., from localStorage or another source)
    private getTenantId(): string {
        const tenantId = localStorage.getItem('tenantId'); // Example: get tenant ID from localStorage
        if (!tenantId) {
            throw new Error('Tenant ID not found');
        }
        return tenantId;
    }

    // Other existing methods
    getDropdownData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
        try {
            const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
            return collectionData(ref, { idField: 'id' }).pipe(
                catchError(error => {
                    console.error(`Error retrieving data for endpoint ${ENDPOINTS[endpointKey]}:`, error);
                    throw new Error(`${ENDPOINTS[endpointKey]} Dropdown retrieval failed: ${error.message}`);
                })
            );
        } catch (error) {
            console.error(`Error initializing data retrieval for endpoint ${ENDPOINTS[endpointKey]}:`, error);
            throw new Error(`${ENDPOINTS[endpointKey]} Dropdown initialization failed: ${error}`);
        }
    }

    private logEvent(action: string, user: string) {
        const logEntry = {
            action: action,
            user: user,
            timestamp: new Date() // Use server timestamp for consistency
        };
        const logRef = collection(this.firestore, 'auditLogs');
        addDoc(logRef, logEntry)
            .then(docRef => {
                this.logger.log(`Audit log recorded with ID: ${docRef.id}`);
                this.events.next([...this.events.value, logEntry]);
            })
            .catch(error => {
                this.logger.error('Error logging event:', error);
            });
    }

    async fetchData(pageSize: number, endpointKey: keyof typeof ENDPOINTS, id: string): Promise<any> {
        const colRef = collection(this.firestore, ENDPOINTS[endpointKey]);
        const q = this.lastVisible ? query(colRef, orderBy('lastName'), startAfter(this.lastVisible), limit(pageSize))
            : query(colRef, orderBy('lastName'), limit(pageSize));

        const documentSnapshots = await getDocs(q);

        // Capture the last visible document
        this.lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

        // Map documents to data
        return documentSnapshots.docs.map(doc => doc.data());
    }

    resetPagination() {
        this.lastVisible = null;
    }
}
