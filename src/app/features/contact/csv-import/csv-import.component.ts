import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import { collection, addDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [],
  templateUrl: './csv-import.component.html',
  styleUrl: './csv-import.component.css'
})
export class CsvImportComponent {
  constructor(private firestore: Firestore) { }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  processFile(file: File) {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const data = this.mapCsvToJson(result.data);
          this.uploadData(data);
        }
      });
    }
  }

  mapCsvToJson(data: any[]): any[] {
    return data.map(entry => {
      const linkedInUrl = entry.linkedinUrl || entry['LinkedIn URL'];
      let socialMediaArray = [];
      if (linkedInUrl) {
        socialMediaArray.push({
          platform: 'LinkedIn',
          url: linkedInUrl,
          username: null, // Add username if available or leave null
          verified: false  // Assuming 'verified' is false by default
        });
      }
      return {
        firstName: entry['First Name'] || entry.firstName || entry.first_name,
        lastName: entry['Last Name'] || entry.lastName || entry.last_name,
        company: entry['Company Name'] || entry.companyName || entry.Company,
        emailAddresses: [{
          emailAddress: entry.Email || entry.email,
          emailAddressType: 'Primary',  // Defaulting type to 'Primary'
          blocked: false  // Defaulting to false
        }],
        phoneNumbers: [{
          phoneNumber: entry['Phone Number'] || entry.phone,
          phoneNumberType: 'Mobile'  // Defaulting type to 'Mobile'
        }],
        socialMedia: socialMediaArray,
        addresses: [{
          streetAddress: entry.addresses_streetAddress,
          city: entry.addresses_city,
          state: entry.addresses_state,
          zip: entry.addresses_zip,
          country: entry.addresses_country,
          county: entry.addresses_county,
          addressType: entry.addresses_addressType,
          latitude: parseFloat(entry.addresses_latitude),
          longitude: parseFloat(entry.addresses_longitude)
        }]
        // Add other fields as necessary
      };
    });
  }

  async uploadData(data: any[]) {
    const ref = collection(this.firestore, 'contacts');
    for (const item of data) {
      try {
        await addDoc(ref, item);
        console.log('Document added successfully');
      } catch (error) {
        console.error('Error adding document:', error);
      }
    }
  }

}
