import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, getDocs, updateDoc, deleteDoc, DocumentData, query, where, orderBy, startAfter, limit, DocumentReference } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';  // Make sure the path is correct
import { Observable, BehaviorSubject, map } from 'rxjs';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private lastVisible: DocumentData | null = null;

    private messageSubject = new BehaviorSubject<string | null>(null);

    // Observable stream for messages
    message$ = this.messageSubject.asObservable();
  

    constructor(private firestore: Firestore, private logger: LoggerService, private authService: AuthService) { }

    getRealtimeData(endpointKey: keyof typeof ENDPOINTS): Observable<any[]> {
        const ref = this.getCollectionRef(endpointKey);
        const messagesQuery = query(ref, orderBy('timestamp', 'desc'), limit(25));
        return collectionData(messagesQuery, { idField: 'id' }).pipe(
          map(messages => messages.map(message => ({
            ...message,
            timestamp: (message['timestamp'] as any).toDate()  // Convert Firestore timestamp to JavaScript Date
          })))
        ) as Observable<any[]>;
    }

    async fetchMoreData(endpointKey: keyof typeof ENDPOINTS, pageSize: number): Promise<any[]> {
        const ref = this.getCollectionRef(endpointKey);
        const messagesQuery = this.lastVisible
            ? query(ref, orderBy('timestamp', 'desc'), startAfter(this.lastVisible), limit(pageSize))
            : query(ref, orderBy('timestamp', 'desc'), limit(pageSize));

        const snapshot = await getDocs(messagesQuery);
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    addMessage(endpointKey: keyof typeof ENDPOINTS, message: any): Promise<DocumentReference<DocumentData>> {
        const ref = this.getCollectionRef(endpointKey);
        this.logger.info("Adding", message);
        return addDoc(ref, message);
    }

    resetPagination() {
        this.lastVisible = null;
    }

    private getCollectionRef(endpointKey: keyof typeof ENDPOINTS) {
        if (environment.multiTenant) {
            const tenantId = this.getTenantId();
            this.logger.info("Get Collection Ref", `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
            return collection(this.firestore, `tenants/${tenantId}/${ENDPOINTS[endpointKey]}`);
        } else {
          this.logger.info("Get Collection Ref", ENDPOINTS[endpointKey]);
          return collection(this.firestore, ENDPOINTS[endpointKey]);
        }
    }

    private getTenantId(): string {
        const tenantId = this.authService.getTenant();
        if (!tenantId) {
            throw new Error('Tenant ID is null');
        }
        return tenantId;
    }


  // Method to send message to chat board
  sendMessageToChatBoard(message: string): void {
    this.messageSubject.next(message);
  }

  getMessage(): string | null {
    const message = this.messageSubject.getValue();
    this.messageSubject.next(null); // Clear the message after retrieving
    return message;
  }

}