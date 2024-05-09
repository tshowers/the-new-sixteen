import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Papa from 'papaparse';
import { collection, addDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { LoggerService } from '../../../services/logger.service';
import { Contact, Company, EmailAddress, PhoneNumber, Address, SocialMedia } from '../../../shared/data/interfaces/contact.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [],
  templateUrl: './csv-import.component.html',
  styleUrl: './csv-import.component.css'
})
export class CsvImportComponent implements OnInit, OnDestroy {

  private userSubscription!: Subscription;
  private userId!: string;

  constructor(private firestore: Firestore, private logger: LoggerService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }



  onFileSelect(event: any) {
    const file = event.target.files[0];
    this.logger.info('onFileSelect');
    this.processFile(file);
  }

  onDrop(event: DragEvent) {
    this.logger.info('onDrop');
    event.preventDefault();
    this.logger.info('preventDefault');
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }


  onDragOver(event: DragEvent) {
    this.logger.info('onDragOver');
    event.preventDefault();
    this.logger.info('onDragOver-stopPropagation');
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    this.logger.info('onDragLeave');
    event.preventDefault();
    this.logger.info('onDragLeave-stopPropagation');
    event.stopPropagation();
  }

  processFile(file: File) {
    this.logger.info('processFile');
    if (file) {
      this.logger.info('Papa.parse');
      Papa.parse(file, {
        header: true,
        transformHeader: header => header.toLowerCase(),
        skipEmptyLines: true,
        complete: (result) => {
          const data = this.mapCsvToJson(result.data);
          this.uploadData(data);
        }
      });
    }
  }

  // mapCsvToJson(data: any[]): any[] {
  //   return data.map(entry => {
  //     const linkedInUrl = entry.linkedinUrl || entry['LinkedIn URL'];
  //     let socialMediaArray = [];
  //     if (linkedInUrl) {
  //       socialMediaArray.push({
  //         platform: 'LinkedIn',
  //         url: linkedInUrl,
  //         username: null, // Add username if available or leave null
  //         verified: false  // Assuming 'verified' is false by default
  //       });
  //     }
  //     return {
  //       firstName: entry['First Name'] || entry.firstName || entry.first_name,
  //       lastName: entry['Last Name'] || entry.lastName || entry.last_name,
  //       company: entry['Company Name'] || entry.companyName || entry.Company,
  //       emailAddresses: [{
  //         emailAddress: entry.Email || entry.email,
  //         emailAddressType: 'Primary',  // Defaulting type to 'Primary'
  //         blocked: false  // Defaulting to false
  //       }],
  //       phoneNumbers: [{
  //         phoneNumber: entry['Phone Number'] || entry.phone,
  //         phoneNumberType: 'Mobile'  // Defaulting type to 'Mobile'
  //       }],
  //       socialMedia: socialMediaArray,
  //       addresses: [{
  //         streetAddress: entry.addresses_streetAddress,
  //         city: entry.addresses_city,
  //         state: entry.addresses_state,
  //         zip: entry.addresses_zip,
  //         country: entry.addresses_country,
  //         county: entry.addresses_county,
  //         addressType: entry.addresses_addressType,
  //         latitude: parseFloat(entry.addresses_latitude),
  //         longitude: parseFloat(entry.addresses_longitude)
  //       }]
  //       // Add other fields as necessary
  //     };
  //   });
  // }
  mapCsvToJson(data: any[]): Contact[] {
    return data.map(entry => ({
      firstName: this.getCaseInsensitiveField(entry, 'First Name') || this.getCaseInsensitiveField(entry, 'firstName') || this.getCaseInsensitiveField(entry, 'first_name'),
      lastName: this.getCaseInsensitiveField(entry, 'Last Name') || this.getCaseInsensitiveField(entry, 'lastName') || this.getCaseInsensitiveField(entry, 'last_name') || "No Last Name",
      company: { 
        name: this.getCaseInsensitiveField(entry, 'Company Name') || this.getCaseInsensitiveField(entry, 'companyName') || this.getCaseInsensitiveField(entry, 'Company') || "Unknown Company"
      },
      acquisitionSource: 'import',
      dateAdded: new Date().toISOString(),
  
      lastUpdated: new Date().toISOString(),
      lastViewed: new Date().toISOString(),
      timeStamp: new Date(),
      lastUpdatedBy: this.userId,
  
      emailAddresses: this.getCaseInsensitiveField(entry, 'Email') || this.getCaseInsensitiveField(entry, 'email') ? [{
        emailAddress: this.getCaseInsensitiveField(entry, 'Email') || this.getCaseInsensitiveField(entry, 'email'),
        emailAddressType: 'Primary',
        blocked: false
      }] : [],
      phoneNumbers: this.getCaseInsensitiveField(entry, 'Phone Number') || this.getCaseInsensitiveField(entry, 'phone') ? [{
        phoneNumber: this.getCaseInsensitiveField(entry, 'Phone Number') || this.getCaseInsensitiveField(entry, 'phone'),
        phoneNumberType: 'Mobile'
      }] : [],
      socialMedia: this.getCaseInsensitiveField(entry, 'LinkedInURL') ? [{
        platform: 'LinkedIn',
        url: this.getCaseInsensitiveField(entry, 'LinkedInURL'),
        username: undefined,
        verified: false
      }] : [],
      addresses: this.getCaseInsensitiveField(entry, 'address') ? [{
        streetAddress: this.getCaseInsensitiveField(entry, 'address.streetAddress'),
        city: this.getCaseInsensitiveField(entry, 'address.city'),
        state: this.getCaseInsensitiveField(entry, 'address.state'),
        zip: this.getCaseInsensitiveField(entry, 'address.zip'),
        country: this.getCaseInsensitiveField(entry, 'address.country'),
        county: this.getCaseInsensitiveField(entry, 'address.county'),
        addressType: 'Home',
        latitude: parseFloat(this.getCaseInsensitiveField(entry, 'address.latitude')) || 0,
        longitude: parseFloat(this.getCaseInsensitiveField(entry, 'address.longitude')) || 0
      }] : [],
      notes: [{
        subject: 'Imported from CSV',
        body: this.getCaseInsensitiveField(entry, 'NoteContent') || 'No detailed notes provided.'
      }]
    }));
  }
  



  // async uploadData(data: any[]) {
  //   const ref = collection(this.firestore, 'contacts');
  //   for (const item of data) {
  //     try {
  //       await addDoc(ref, item);
  //       this.logger.log('Document added successfully');
  //     } catch (error) {
  //       this.logger.error('Error adding document:', error);
  //     }
  //   }
  // }
  async uploadData(data: Contact[]) {
    const ref = collection(this.firestore, 'contacts');
    for (const item of data) {
      try {
        await addDoc(ref, item);
        this.logger.log('Document added successfully');
      } catch (error) {
        this.logger.error(`Error adding document: ${JSON.stringify(item)}`, error);
      }
    }
  }

  getCaseInsensitiveField(entry: any, fieldName: string): any {
    const key = Object.keys(entry).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key ? entry[key] : undefined;
  }

}
