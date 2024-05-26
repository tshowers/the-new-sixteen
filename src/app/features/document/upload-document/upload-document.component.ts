import { Component, inject, ElementRef, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { Document } from '../../../shared/data/interfaces/docuttach.model';
import { Image } from '../../../shared/data/interfaces/image.model';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { ContactService } from '../../../services/contact.service';
import { LoggerService } from '../../../services/logger.service';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.css']
})
export class UploadDocumentComponent implements OnInit, OnDestroy {
  storage = getStorage();
  uploadProgress: number | null = null;
  downloadURL: string | null = null;
  error: string | null = null;
  processing: boolean = false;
  message!: string;
  userSubscription!: Subscription;
  subscription!: Subscription;
  userId!: string;


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() contact!: Contact;

  constructor(private router: Router, private authService: AuthService, private dataService: DataService, private contactService: ContactService, private logger: LoggerService) {
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.startUp();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  startUp(): void {
    this.subscription = this.contactService.currentContact.subscribe(contact => {
      this.logger.info("Contact provided by subscription", JSON.stringify(contact, null, 2));
      if (contact && contact.id) {
        this.contact = contact;
        if (!this.contact.images) {
          this.contact.images = [];
        }
        if (!this.contact.documents) {
          this.contact.documents = [];
        }
      } else {
        this.logger.info("No contact provided, redirecting to contact-edit.");
        this.router.navigate(['/contact-edit']);
      }
    });

    this.logger.info("Upload is using this contact", JSON.stringify(this.contact, null, 2));
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.removeDragData(event);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  removeDragData(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.clearData();
    }
  }

  uploadFile(file: File) {
    const storageRef = ref(this.storage, 'uploads/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    this.processing = true;

    uploadTask.on('state_changed',
      (snapshot) => {
        this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + this.uploadProgress + '% done');
      },
      (error) => {
        this.error = error.message;
        this.processing = false;
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          this.downloadURL = downloadURL;
          this.processing = false;
          console.log('File available at', downloadURL);

          const uploadDate = new Date().toISOString();
          if (file.type.startsWith('image/')) {
            const image: Image = {
              src: downloadURL,
              alt: file.name,
              contactId: this.contact.id
            };
            this.contact.images?.push(image);
          } else {
            const document: Document = {
              src: downloadURL,
              name: file.name,
              type: 'document',
              uploadDate: uploadDate,
              contactId: this.contact.id
            };
            this.contact.documents?.push(document);
          }

          this.updateContact();
        });
      }
    );
  }

  updateContact(): void {
    if (this.contact && this.contact.id) {
      this.contactService.setRecordState(this.contact);
      this.dataService.updateDocument('CONTACTS', this.contact.id, this.contact, this.userId)
        .then(() => {
          console.log('Contact updated successfully');
          this.router.navigate(['/contact-edit']);

        })
        .catch(error => {
          console.error('Error updating contact:', error);
          this.router.navigate(['/error']); // Assuming you have an error route defined

        });
    }

  }
}
