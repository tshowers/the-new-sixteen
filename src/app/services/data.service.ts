import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, getDocs, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';  // Make sure the path is correct
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private firestore: Firestore) { }

    /**
     * Retrieves real-time data from the specified Firestore collection.
     * This method returns an Observable that emits the latest state of the collection
     * whenever the data changes, making it suitable for real-time data binding.
     * 
     * @param {keyof typeof ENDPOINTS} endpointKey - The key from the ENDPOINTS object which corresponds
     * to the desired Firestore collection.
     * @returns {Observable<any[]>} An Observable that emits an array of the documents in the specified collection.
     * Each document is represented as an object with its fields and an 'id' field added.
     * 
     * Usage:
     * this.dataService.getRealtimeData('USERS').subscribe(users => {
     *   console.log(users);
     * });
     */
    // getRealtimeData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
    //     const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
    //     return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
    // }
    getRealtimeData(endpointKey: keyof typeof ENDPOINTS, user: string): Observable<any[]> {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        // Log the initiation of a real-time data subscription
        this.logEvent(`${user} started a real-time data subscription to ${ENDPOINTS[endpointKey]}`, user);
        return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
    }



    /**
   * Fetches data once from the specified Firestore collection.
   * This method retrieves the entire collection's documents once and does not listen for changes.
   * It is suitable for use cases where real-time data is not required.
   * 
   * @param {keyof typeof ENDPOINTS} endpointKey - The key from the ENDPOINTS object which corresponds
   * to the desired Firestore collection.
   * @returns {Promise<any[]>} A Promise that resolves to an array of the documents in the specified collection.
   * Each document is represented as an object with its fields and an 'id' field added. The promise
   * rejects with an error if there is an issue fetching the data.
   * 
   * Usage:
   * this.dataService.getCollectionData('USERS').then(users => {
   *   console.log(users);
   * }).catch(error => {
   *   console.error("Error fetching documents:", error);
   * });
   */
    // getCollectionData(endpointKey: keyof typeof ENDPOINTS, user: string) {
    //     const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
    //     return getDocs(ref)
    //         .then(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    //         .catch(error => console.error("Error fetching documents:", error));
    // }
    getCollectionData(endpointKey: keyof typeof ENDPOINTS, user: string) {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        return getDocs(ref)
            .then(snapshot => {
                // Log the fetch action after successful data retrieval
                this.logEvent(`${user} fetched documents from ${ENDPOINTS[endpointKey]}`, user);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            })
            .catch(error => {
                console.error("Error fetching documents:", error);
                // Optionally, log the error event here as well
                this.logEvent(`${user} failed to fetch documents from ${ENDPOINTS[endpointKey]} due to ${error}`, user);
                throw new Error(error);
            });
    }



    addDocument(endpointKey: keyof typeof ENDPOINTS, data: any, user: string) {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        return addDoc(ref, data)
            .then(docRef => {
                this.logEvent(`${user} added a new document to ${ENDPOINTS[endpointKey]}`, user);
                return docRef.id
            })
            .catch(error => {
                console.error("Error adding document:", error);
                this.logEvent(`${user} failed to add document to ${ENDPOINTS[endpointKey]} due to ${error}`, user);

            });
    }

    // updateDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string) {
    //     const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
    //     return updateDoc(docRef, data).then(addRef => {
    //         this.logEvent(`${user} added a new document to ${ENDPOINTS[endpointKey]}`, user);
    //     })
    //         .catch(error => {
    //             console.error("Error updating document:", error);
    //             this.logEvent(`${user} failed to update document to ${ENDPOINTS[endpointKey]} due to ${error}`, user);
    //         });
    // }
    updateDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any, user: string) {
        const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
        return updateDoc(docRef, data).then(() => {
            this.logEvent(`${user} updated a document in ${ENDPOINTS[endpointKey]}`, user);
            // Optionally return some identifier or success message
            return { success: true, id: id };
        }).catch(error => {
            console.error("Error updating document:", error);
            this.logEvent(`${user} failed to update document in ${ENDPOINTS[endpointKey]} due to ${error}`, user);
            // Optionally rethrow or handle the error for caller
            throw new Error(`Update failed: ${error}`);
        });
    }

    // deleteDocument(endpointKey: keyof typeof ENDPOINTS, id: string, user: string) {
    //     const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
    //     return deleteDoc(docRef).then(deleteRef => {
    //         this.logEvent(`${user} deleted document in ${ENDPOINTS[endpointKey]}`, user);

    //     })
    //         .catch(error => console.error("Error deleting document:", error));
    // }
    deleteDocument(endpointKey: keyof typeof ENDPOINTS, id: string, user: string) {
        const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
        return deleteDoc(docRef).then(() => {
            this.logEvent(`${user} deleted a document in ${ENDPOINTS[endpointKey]}`, user);
            // Optionally return some identifier or success message
            return { success: true, id: id };
        }).catch(error => {
            console.error("Error deleting document:", error);
            this.logEvent(`${user} failed to delete document in ${ENDPOINTS[endpointKey]} due to ${error}`, user);
            // Optionally rethrow or handle the error for caller
            throw new Error(`Delete failed: ${error}`);
        });
    }



    private logEvent(action: string, user: string) {
        const logEntry = {
            action: action,
            user: user,
            timestamp: new Date() // Use server timestamp for consistency
        };
        // Logging directly to the 'auditLogs' collection
        // this.firestore.collection('auditLogs').add(logEntry);
        const logRef = collection(this.firestore, 'auditLogs');
        addDoc(logRef, logEntry)
            .then(docRef => {
                console.log(`Audit log recorded with ID: ${docRef.id}`);
            })
            .catch(error => {
                console.error('Error logging event:', error);
            });

    }

}
