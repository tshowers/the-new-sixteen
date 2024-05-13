import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';
import { collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { LoggerService } from '../../../services/logger.service';
import { Contact, Company, EmailAddress, PhoneNumber, Address, SocialMedia } from '../../../shared/data/interfaces/contact.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs';

type PlatformFields = {
  [key: string]: string[];  // This tells TypeScript that any string key will index to an array of strings
};

// Now, declare your platformFields with this type
const platformFields: PlatformFields = {
  'LinkedIn': ['LinkedIn', 'LinkedInURL', 'LinkedIn URL'],
  'Facebook': ['Facebook', 'FacebookURL', 'Facebook URL'],
  'Twitter': ['Twitter', 'TwitterHandle', 'Twitter URL'],
  'YouTube': ['YouTube', 'YouTubeChannel', 'YouTube URL'],
  'Website': ['Website', 'WebsiteURL', 'Website URL']
};

@Component({
  selector: 'app-csv-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csv-import.component.html',
  styleUrl: './csv-import.component.css'
})
export class CsvImportComponent implements OnInit, OnDestroy {

  private userSubscription!: Subscription;
  private userId!: string;
  public processing: boolean = false;
  public message: string = '';


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
    this.message = 'Reading File';
    this.processing = true;  // Start processing
    if (file) {
      this.logger.info('Papa.parse');
      this.message = 'Parsing File';
      Papa.parse(file, {
        header: true,
        transformHeader: header => header.toLowerCase(),
        skipEmptyLines: true,
        complete: async (result) => {
          const data = this.mapCsvToJson(result.data);
          const uploadResults = await this.uploadData(data);
          this.processing = false;  // Stop processing after upload is complete
          this.message = `Complete. Success: ${uploadResults.successCount}, Failures: ${uploadResults.failureCount}, Skipped: ${uploadResults.skippedCount}`;
          this.logger.info('Processing complete. ' + this.message);
        }
      });
    } else {
      this.processing = false;  // Stop processing if no file
      this.message = "No file selected or file is empty";
      this.logger.info(this.message);
    }
  }




  mapCsvToJson(data: any[]): Contact[] {
    const firstNameFields = ['First Name', 'firstName', 'first_name', 'Owner First'];  // Include all possible variations
    const lastNameFields = ['Last Name', 'lastName', 'last_name', 'Owner Last'];  // Include all possible variations
    const professionFields = ['Title', 'profession', 'Job Title'];  // Include all possible variations
    const companyFields = ['Company', 'companyName'];  // Include all possible variations
    const profileTypeFields = ['profileType', 'tags', 'Certification Type'];  // Include all possible variations
    const companySizeFields = ['Company size', 'Total Number of Employees'];

    this.message = 'Reading Line ' + data;

    return data.map(entry => ({
      firstName: this.getSingleFieldCaseInsensitiveField(entry, firstNameFields) || '',
      lastName: this.getSingleFieldCaseInsensitiveField(entry, lastNameFields) || '',
      title: this.getSingleFieldCaseInsensitiveField(entry, professionFields) || '',
      status: this.getCaseInsensitiveField(entry, 'status') || '',
      nickname: this.getCaseInsensitiveField(entry, 'nickname') || '',
      birthday: this.getCaseInsensitiveField(entry, 'birthday') || '',
      anniversary: this.getCaseInsensitiveField(entry, 'anniversary') || '',
      gender: this.getCaseInsensitiveField(entry, 'gender') || '',


      company: {
        name: this.getSingleFieldCaseInsensitiveField(entry, companyFields) || '',
        dba: this.getCaseInsensitiveField(entry, 'DBA Name') || '',
        numberOfEmployees: this.getSingleFieldCaseInsensitiveField(entry, companySizeFields) || '',
        phoneNumbers: this.getPhoneNumbers(entry),  // This should ensure no undefined values
      },
      phoneNumbers: this.getAdditionalPhoneNumbers(entry),  // Handle additional phone numbers similarly
      addresses: this.getAddresses(entry),  // Ensure addresses are properly checked for undefined values
      emailAddresses: this.initializeEmailAddresses(entry),
      notes: [{
        subject: 'Imported from CSV',
        body: this.getCaseInsensitiveField(entry, 'Notes') || 'No detailed notes provided.'
      }],
      timezone: this.getCaseInsensitiveField(entry, 'TIMEZONE') || '',
      acquisitionSource: 'import',
      profileTypes: this.parseTags(this.getSingleFieldCaseInsensitiveField(entry, profileTypeFields) || []),
      socialMedia: this.getSocialMediaProfiles(entry) || [],  // Ensure social media is also handled
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      lastViewed: new Date().toISOString(),
      timeStamp: new Date(),

    }));
  }


  parseTags(tagsString: any): string[] {
    // Check if tagsString is an array
    if (Array.isArray(tagsString)) {
      // Process each element of the array as a tag
      return tagsString.map(tag => {
        if (typeof tag === 'string') {
          return tag.trim().replace(/^"|"$/g, ''); // Assuming tags in array are already formatted correctly
        }
        console.error("Non-string element in tags array:", tag);
        return ''; // Or handle non-string elements as needed
      });
    } else if (typeof tagsString === 'string') {
      // Process tagsString as a single string of tags
      return tagsString.split(',').map(tag => tag.trim().replace(/^"|"$/g, ''));
    } else {
      // Log an error if tagsString is neither an array nor a string
      console.error("Expected string or array but received:", tagsString);
      return [];
    }
  }



  getPhoneNumbers(entry: any): PhoneNumber[] {
    const phoneNumbers: PhoneNumber[] = [];
    const fields = ['Business Number', 'Mobile Number', 'Other Phone Number', 'Phone'];  // Updated fields
    fields.forEach(field => {
      const phoneNumber = this.getCaseInsensitiveField(entry, field);
      if (phoneNumber) {
        phoneNumbers.push({
          phoneNumber,
          phoneNumberType: field.includes('Mobile') ? 'Mobile' : (field.includes('Business') ? 'Business' : 'Other')
        });
      }
    });
    return phoneNumbers.length > 0 ? phoneNumbers : [this.defaultPhoneNumber()];
  }


  defaultPhoneNumber(): PhoneNumber {
    return { phoneNumber: '', phoneNumberType: '' };  // Default empty phone number
  }

  getSocialMediaProfiles(entry: any): SocialMedia[] {
    const platforms = ['LinkedIn', 'Facebook', 'Twitter', 'YouTube', 'Website'];

    const socialMediaProfiles: SocialMedia[] = platforms.flatMap(platform => {
      const url = this.getCaseInsensitiveField(entry, `${platform} Profile`);
      if (url) {
        return [{
          platform: platform,
          url: url,
          username: null, // Assuming usernames aren't separately provided
          verified: false  // Default to false, adjust based on data
        }];
      }
      return [];
    });

    return socialMediaProfiles;
  }



  initializeEmailAddresses(entry: any): EmailAddress[] {
    const emailFields = ['Email Address', 'Email'];  // Updated to match CSV header
    const emailAddresses: EmailAddress[] = emailFields.flatMap(field => {
      const emailAddress = this.getCaseInsensitiveField(entry, field);
      if (emailAddress) {
        return [{
          emailAddress: emailAddress.toLowerCase(),
          emailAddressType: 'Primary',  // Assuming all are primary for simplification
          blocked: false
        }];
      }
      return [];
    });

    return emailAddresses;
  }




  getAddresses(entry: any): Address[] {
    const addressFields = ['Business Address', 'Home Address', 'Physical Address', 'Mailing Address'];  // Assuming Home Address needs to be added to CSV or handled if already present
    const addresses: Address[] = addressFields.flatMap(field => {
      const streetAddress = this.getCaseInsensitiveField(entry, field);
      const city = this.getCaseInsensitiveField(entry, 'City');
      const state = this.getCaseInsensitiveField(entry, 'State');
      const zip = this.getCaseInsensitiveField(entry, 'Zip');
      const country = this.getCaseInsensitiveField(entry, 'Country'); // Assuming there's a general 'Country' field
      const county = this.getCaseInsensitiveField(entry, 'County'); // de if there's a separate County field
      const latitude = parseFloat(this.getCaseInsensitiveField(entry, `${field} Latitude`)) || 0;
      const longitude = parseFloat(this.getCaseInsensitiveField(entry, `${field} Longitude`)) || 0;

      if (streetAddress) {
        return [{
          streetAddress: streetAddress,
          city: city || '',
          state: state || '',
          zip: zip || '',
          country: country || '',
          county: county || '',
          addressType: field.includes('Home') ? 'Home' : 'Business',
          latitude: latitude, // Update if latitude and longitude are separate fields
          longitude: longitude
        }];
      }
      return [];
    });

    return addresses;
  }



  getAdditionalPhoneNumbers(entry: any): PhoneNumber[] {
    const phoneNumbers: PhoneNumber[] = [];
    const additionalFields = ['Secondary Phone', 'Emergency Phone', 'other phone number', 'Fax'];

    additionalFields.forEach(field => {
      const phoneNumber = this.getCaseInsensitiveField(entry, field);
      if (phoneNumber) {
        phoneNumbers.push({
          phoneNumber: phoneNumber,
          phoneNumberType: field.includes('Emergency') ? 'Emergency' : 'Secondary'
        });
      }
    });

    return phoneNumbers;
  }




  getEmail(entry: any, key: string, type: string): EmailAddress | undefined {
    const email = this.getCaseInsensitiveField(entry, key);
    if (!email) return undefined;
    return {
      emailAddress: email.toLowerCase(),
      emailAddressType: type,
      blocked: false
    };
  }



  parseAddress(entry: any, baseKey: string, addressType: string): Address | undefined {
    const streetAddress = this.getCaseInsensitiveField(entry, baseKey);
    if (!streetAddress) return undefined;  // Return undefined if no street address is found

    return {
      streetAddress: streetAddress,
      city: this.getCaseInsensitiveField(entry, `${baseKey}.city`),
      state: this.getCaseInsensitiveField(entry, `${baseKey}.state`),
      zip: this.getCaseInsensitiveField(entry, `${baseKey}.zip`),
      country: this.getCaseInsensitiveField(entry, `${baseKey}.country`),
      county: this.getCaseInsensitiveField(entry, `${baseKey}.county`),
      addressType: addressType,
      latitude: parseFloat(this.getCaseInsensitiveField(entry, `${baseKey}.latitude`)) || 0,
      longitude: parseFloat(this.getCaseInsensitiveField(entry, `${baseKey}.longitude`)) || 0
    };
  }




  async uploadData(data: Contact[]) {
    const ref = collection(this.firestore, 'contacts');
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;  // Count for duplicates or no email cases

    for (const item of data) {
      try {
        // Ensure there is at least one email address and it's not undefined
        if (item.emailAddresses && item.emailAddresses.length > 0 && item.emailAddresses[0].emailAddress) {
          item.email = item.emailAddresses[0].emailAddress.toLowerCase();
          const exists = await this.checkIfExists(item.emailAddresses[0].emailAddress);
          if (!exists) {
            await addDoc(ref, item);
            successCount++;
            this.logger.log('Document ' + successCount + ' added successfully');
            this.message = 'Document ' + successCount + ' added successfully.';

          } else {
            this.logger.log(`Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`);
            this.message = `Duplicate found, skipping: ${item.emailAddresses[0].emailAddress}`;
            skippedCount++;
          }
        } else {
          // Handle cases where there is no email address
          this.logger.log('No valid email found, skipping document.', item);
          this.message = 'No valid email found, skipping document.', item;
          skippedCount++;
        }
      } catch (error) {
        this.logger.error(`Error adding document: ${JSON.stringify(item)}, error: ${error}`);
        this.message = `Error adding document: ${JSON.stringify(item)}, error: ${error}`;
        failureCount++;
      }
    }

    this.logger.info(`Upload Summary: ${successCount} records added successfully, ${failureCount} records failed, ${skippedCount} records skipped.`);
    return { successCount, failureCount, skippedCount };
  }



  getCaseInsensitiveField(entry: any, fieldName: string): any {
    const key = Object.keys(entry).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key ? entry[key] : undefined;
  }

  getSingleFieldCaseInsensitiveField(entry: any, fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      const key = Object.keys(entry).find(k => k.toLowerCase() === fieldName.toLowerCase());
      if (key) {
        return entry[key];
      }
    }
    return undefined;  // Return undefined if none of the fieldNames match
  }




  async checkIfExists(email: string): Promise<boolean> {
    this.message = "checking to see if " + email + " already exists";
    this.logger.info("checking to see if " + email + " already exists");
    if (!email) {
        this.logger.warn("checkIfExists called with no email provided.");
        return false;
    }
    const ref = collection(this.firestore, 'contacts');
    const q = query(ref, where('email', '==', email.toLowerCase()));
    try {
        console.log(`Executing query for email: ${email}`);
        const querySnapshot = await getDocs(q);
        console.log(`Query results:`, querySnapshot.docs.map(doc => doc.data()));
        this.logger.info(`Query executed. Found ${querySnapshot.size} documents matching email: ${email}`);
        const exists = !querySnapshot.empty;
        this.logger.info(`Email ${email} existence check: ${exists ? 'Exists' : 'Does not exist'}.`);
        return exists;
    } catch (error) {
        this.logger.error(`Error executing query for email ${email}: ${error}`);
        return false; // Assume email does not exist if there's a failure in the query
    }
}


}
