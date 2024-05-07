import { Component } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css'
})
export class UploadDocumentComponent {

  downloadUrl$!: Observable<string>;

  constructor(private storageService: StorageService) {}

  uploadFile(file: File): void {
    if (file) {
      this.downloadUrl$ = this.storageService.uploadFile(file);
    }
  }

}
