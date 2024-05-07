import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: AngularFireStorage) {}

  // Upload file and return an observable of the download URL
  uploadFile(file: File): Observable<string> {
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // Return an observable that emits the download URL upon completion
    return new Observable(observer => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          observer.next(downloadURL);
          observer.complete();
        })
      ).subscribe();
    });
  }
}
