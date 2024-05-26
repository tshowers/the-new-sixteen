import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, getDocs, updateDoc, deleteDoc, DocumentData, query, where, orderBy, startAfter, limit, DocumentReference } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';  // Make sure the path is correct
import { Observable, BehaviorSubject, map } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private lastVisible: DocumentData | null = null;

    constructor(private firestore: Firestore, private logger: LoggerService) { }

    getRealtimeData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        const messagesQuery = query(ref, orderBy('timestamp', 'desc'), limit(25));
        return collectionData(messagesQuery, { idField: 'id' }).pipe(
          map(messages => messages.map(message => ({
            ...message,
            timestamp: (message['timestamp'] as any).toDate()  // Convert Firestore timestamp to JavaScript Date
          })))
        ) as Observable<any[]>;
      }

    async fetchMoreData(endpointKey: keyof typeof ENDPOINTS, pageSize: number): Promise<any[]> {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        const messagesQuery = this.lastVisible
            ? query(ref, orderBy('timestamp', 'desc'), startAfter(this.lastVisible), limit(pageSize))
            : query(ref, orderBy('timestamp', 'desc'), limit(pageSize));

        const snapshot = await getDocs(messagesQuery);
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    addMessage(endpointKey: keyof typeof ENDPOINTS, message: any): Promise<DocumentReference<DocumentData>> {
        const ref = collection(this.firestore, ENDPOINTS[endpointKey]);
        this.logger.info("Adding", message);
        return addDoc(ref, message);
    }

    resetPagination() {
        this.lastVisible = null;
    }


}