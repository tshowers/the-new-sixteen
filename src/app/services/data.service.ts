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
    getRealtimeData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
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
    getCollectionData(endpointKey: keyof typeof ENDPOINTS) {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        return getDocs(ref)
            .then(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            .catch(error => console.error("Error fetching documents:", error));
    }


    addDocument(endpointKey: keyof typeof ENDPOINTS, data: any) {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        return addDoc(ref, data)
            .then(docRef => docRef.id)
            .catch(error => console.error("Error adding document:", error));
    }

    updateDocument(endpointKey: keyof typeof ENDPOINTS, id: string, data: any) {
        const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
        return updateDoc(docRef, data)
            .catch(error => console.error("Error updating document:", error));
    }

    deleteDocument(endpointKey: keyof typeof ENDPOINTS, id: string) {
        const docRef = doc(this.firestore, ENDPOINTS[endpointKey], id);
        return deleteDoc(docRef)
            .catch(error => console.error("Error deleting document:", error));
    }



    
}
