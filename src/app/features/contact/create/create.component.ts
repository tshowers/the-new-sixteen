import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { ReadComponent } from '../read/read.component';
import { DataService } from '../../../services/data.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'; // Import Router from Angular's router package
import { filter } from 'rxjs/operators';
import { ContactService } from '../../../services/contact.service';
import { environment } from '../../../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { LoggerService } from '../../../services/logger.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NaicsPipe } from '../../../shared/filters/naics.pipe';
import { Subscription } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet, ReadComponent, NaicsPipe],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit, OnDestroy {

  currentStep = 0;
  totalSteps: number = 14;
  isLoading = false;
  public production: boolean;
  public diagDisplay = "none";
  searchText: string = ''; // Define searchText property
  public toggleDisplay = false;

  @ViewChild('lastContactTimelineChart') private lastContactTimelineChartRef!: ElementRef<HTMLCanvasElement>;
  lastContactTimelineChart!: Chart;

  @ViewChild('communicationFrequencyChart') private communicationFrequencyChartRef!: ElementRef<HTMLCanvasElement>;
  communicationFrequencyChart!: Chart;

  naicsCodes: string[] = [];
  selectedNaicsCodes: string[] = [];

  private subscription!: Subscription;

  contact: Contact = {
    firstName: '',
    middleName: '',
    lastName: '',
    images: [{
      src: 'assets/nophoto.jpg',
      alt: 'No photo available'
    }],
    company: {  // Add default company object here
      name: '',  // Default empty name
      numberOfEmployees: '', // Default value can be empty or a placeholder
      other: '', // Default or initial value
      phoneNumbers: [], // Initialize as empty array
      emailAddresses: [], // Initialize as empty array
      addresses: [], // Initialize as empty array
      url: '', // Default or initial value
      sicCode: '', // Default or initial value
      status: '', // Default or initial value
      shared: false, // Default boolean value
      capabilities: []
    },
    // Default values for new properties
    connectionDetails: {
      startDate: new Date().toISOString(),  // Consider what default makes sense for your use case
      mutualConnections: 0,
      transactionHistory: []
    },
    engagements: [],
    interactions: [],
    acquisitionSource: 'Web',
    dateAdded: new Date().toISOString(),
    lastContacted: new Date().toISOString()
  };;

  constructor(private http: HttpClient, private dataService: DataService, private router: Router, private contactService: ContactService, private logger: LoggerService) {
    this.production = environment.production;

  }

  ngOnInit() {

    this.subscription = this.contactService.currentContact.subscribe(contact => {
      if (contact) {
        let periodStartDate = new Date();
        periodStartDate.setDate(periodStartDate.getDate() - 30); // Set to 30 days ago

        this.contact = contact;
        const lastContactData = this.processSingleContactData(contact);
        setTimeout(() => {
          this.createSingleContactTimelineChart(lastContactData);
          if (contact.id)
            this.loadAndProcessSingleContactFrequency(contact.id, periodStartDate);
        }, 0);
      }

    });

    this.logger.info("Create is using this contact", JSON.stringify(this.contact, null, 2));

    this.fetchNaicsCodes();
  }

  ngOnDestroy() {
    if (this.lastContactTimelineChart) {
      this.lastContactTimelineChart.destroy();
    }
    if (this.communicationFrequencyChart) {
      this.communicationFrequencyChart.destroy();
    }

    this.subscription.unsubscribe();
  }

  fetchNaicsCodes() {
    // Assuming the NAICS CSV file is served at '/assets/naics.csv'
    this.http.get('/assets/naics.csv', { responseType: 'text' }).subscribe(data => {
      // Parse the CSV data and extract NAICS codes
      const lines = data.split('\n');
      // Iterate over each line
      lines.forEach(line => {
        // Split the line into columns
        const columns = line.split(',');
        // Extract the code and title from the columns, and trim double quotes
        const code = columns[0].trim().replace(/"/g, '');
        let title = columns[1].trim().replace(/"/g, '');
        // Strip off the trailing 'T' from the title, if present
        if (title.endsWith('T')) {
          title = title.substring(0, title.length - 1);
        }
        // Concatenate the code and title and push to the naicsCodes array
        this.naicsCodes.push(code + ' - ' + title);
      });
    });
  }

  // Function to add a NAICS code to the capabilities array
  addNaicsCode(naicsCode: string) {
    // Check if the NAICS code already exists in the capabilities array
    if (this.contact && this.contact.company) {
      if (!this.contact.company.capabilities.includes(naicsCode)) {
        // Add the NAICS code to the capabilities array
        this.contact.company.capabilities.push(naicsCode);
      }
    }
  }

  // Function to remove a NAICS code from the capabilities array
  removeNaicsCode(naicsCode: string) {
    // Filter out the NAICS code from the capabilities array
    if (this.contact && this.contact.company) {
      this.contact.company.capabilities = this.contact.company.capabilities.filter((code: string) => code !== naicsCode);
    }
  }

  addSelectedNaicsCodes() {
    if (this.selectedNaicsCodes.length > 0) {
      if (this.contact && this.contact.company) {
        this.contact.company.capabilities.push(...this.selectedNaicsCodes);
        this.selectedNaicsCodes = []; // Clear selected NAICS codes after adding
      }
    }
  }



  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  addEmailAddress() {
    this.contact.emailAddresses = this.contact.emailAddresses || [];
    this.contact.emailAddresses.push({ emailAddress: '', emailAddressType: '', blocked: false });
  }

  removeEmailAddress(index: number) {
    if (this.contact.emailAddresses)
      if (index > -1) {
        this.contact.emailAddresses.splice(index, 1);
      }
  }
  addPhoneNumber() {
    this.contact.phoneNumbers = this.contact.phoneNumbers || [];
    this.contact.phoneNumbers.push({ phoneNumber: '', phoneNumberType: '' });
  }

  removePhoneNumber(index: number) {
    if (this.contact.phoneNumbers)
      if (index > -1) {
        this.contact.phoneNumbers.splice(index, 1);
      }
  }

  addAddress() {
    this.contact.addresses = this.contact.addresses || [];
    this.contact.addresses.push({ streetAddress: '', city: '', state: '', zip: '', country: '', county: '', addressType: '', latitude: 0, longitude: 0 });
  }

  removeAddress(index: number) {
    if (this.contact.addresses)
      if (index > -1) {
        this.contact.addresses.splice(index, 1);
      }
  }

  addSocialMedia() {
    this.contact.socialMedia = this.contact.socialMedia || [];
    this.contact.socialMedia.push({ platform: '', url: '', username: '', verified: false });
  }

  removeSocialMedia(index: number) {
    if (this.contact.socialMedia)
      if (index > -1) {
        this.contact.socialMedia.splice(index, 1);
      }
  }

  print(): void {
    console.log(JSON.stringify(this.contact, null, 2));
  }

  setRecordState(): void {
    if (!this.contact.id) {
      this.contact.dateAdded = new Date().toISOString();
    }
    this.contact.lastUpdated = new Date().toISOString();
    this.contact.lastViewed = new Date().toISOString();
    this.contact.timeStamp = new Date();
  }

  onSubmit() {
    this.isLoading = true;  // Show spinner

    this.setRecordState();

    this.print(); // Assuming print() is a method in your component

    this.dataService.addDocument('CONTACTS', this.contact)
      .then(docId => {
        console.log('Document added with ID:', docId);
        // Navigate to the contact-list page on success
        this.router.navigate(['/contact-list']);
      })
      .catch(error => {
        console.error('Error adding contact:', error);
        // Navigate to an error page on failure
        this.router.navigate(['/error']); // Assuming you have an error route defined
      });
  }

  updateContact(): void {
    // Assuming this.contact is the data to update
    if (this.contact && this.contact.id) {
      this.setRecordState();
      this.dataService.updateDocument('CONTACTS', this.contact.id, this.contact)
        .then(() => {
          console.log('Contact updated successfully');
          this.router.navigate(['/contact-list']);

        })
        .catch(error => {
          console.error('Error updating contact:', error);
          this.router.navigate(['/error']); // Assuming you have an error route defined

        });
    }
  }

  public toggleDiagnostic(): void {
    this.diagDisplay = (this.diagDisplay == "none") ? "" : "none";
    this.toggleDisplay = (this.toggleDisplay) ? false : true;
  }


  processSingleContactData(contact: any): any {
    const lastContactDate = contact.lastContacted ? new Date(contact.lastContacted) : (contact.dateAdded ? new Date(contact.dateAdded.seconds * 1000) : new Date());
    return {
      name: `${contact.firstName} ${contact.lastName}`,
      lastContacted: lastContactDate
    };
  }




  createSingleContactTimelineChart(contactData: any): void {
    const canvas = this.lastContactTimelineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.lastContactTimelineChart) {
      this.lastContactTimelineChart.destroy();
    }

    if (ctx) {
      this.lastContactTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [contactData.name], // Now expects a single name
          datasets: [{
            label: 'Days since last contact',
            data: [Math.floor((new Date().getTime() - contactData.lastContacted.getTime()) / (1000 * 60 * 60 * 24))], // Now expects a single value
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function (value) {
                  return value + ' day' + (value !== 1 ? 's' : ''); // Append 'day' or 'days' correctly
                }
              }
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Days Since Last Contact'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Last Contact Timeline Chart');
    }
  }

  // Function to fetch and process communication frequency for a single contact
  loadAndProcessSingleContactFrequency(contactId: string, periodStartDate: Date): void {
    this.dataService.getCollectionData('COMMUNICATIONS')
      .then(communicationsData => {
        this.logger.info("Loaded communications data:", communicationsData);
        const communicationFrequencyData = this.processSingleContactFrequency(contactId, communicationsData as Communication[], periodStartDate, this.contact.firstName + ' ' + this.contact.lastName);

        if (communicationFrequencyData) {
          setTimeout(() => this.createSingleContactFrequencyChart(communicationFrequencyData, this.contact.firstName + ' ' + this.contact.lastName), 0);
        }
      })
      .catch(err => {
        console.error("Failed to load communications:", err);
        // If there's an error, handle it by using an empty array and proceeding
        const communicationFrequencyData = this.processSingleContactFrequency(contactId, [] as Communication[], periodStartDate, this.contact.firstName + ' ' + this.contact.lastName);
        if (communicationFrequencyData) {
          setTimeout(() => this.createSingleContactFrequencyChart(communicationFrequencyData, this.contact.firstName + ' ' + this.contact.lastName), 0);
        }
      });
  }

  // The rest of your code remains the same


  processSingleContactFrequency(contactId: string, communications: Communication[], periodStartDate: Date, fullName: string): any {
    const periodEnd = new Date();
    let days = [];
    let frequency = new Array(30).fill(0); // Array of 30 days initialized to 0
    let currentDate = new Date(periodStartDate);

    for (let i = 0; i < 30; i++) {
      days.push(`${currentDate.getMonth() + 1}/${currentDate.getDate()}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    communications.forEach(communication => {
      if (communication.contactId === contactId) {
        const commDate = new Date(communication.date);
        if (commDate >= periodStartDate && commDate <= periodEnd) {
          const diffDays = Math.floor((commDate.getTime() - periodStartDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays < 30) {
            frequency[diffDays]++;
          }
        }
      }
    });

    return {
      days: days,
      frequency: frequency,
      fullName: fullName
    };
  }




  // Function to create the chart for a single contact's communication frequency
  createSingleContactFrequencyChart(data: any, fullName: string): void {
    const canvas = this.communicationFrequencyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.communicationFrequencyChart) {
      this.communicationFrequencyChart.destroy();
    }

    if (ctx) {
      this.communicationFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.days,
          datasets: [{
            label: `Communications for ${fullName}`,
            data: data.frequency,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            },
            x: {
              beginAtZero: true,
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `Communication Frequency for ${fullName} Over Last 30 Days`
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context for Communication Frequency Chart');
    }
  }


  isValidEmailForm() {
    // Check if emailAddresses is defined and has at least one valid email
    return this.contact.emailAddresses?.some(email => email.emailAddress.trim() !== '') ?? false;
  }

  nextStepAfterEmail() {
    if (this.isValidEmailForm()) {
      // Proceed to the next step
      this.currentStep++;
    } else {
      // Alert the user to enter at least one email
      alert('Please enter at least one email address.');
    }
  }

  navigateToNote(): void {
    this.contactService.changeContact(this.contact);
    this.router.navigate(['notes']);

  }

  navigateToUpload(): void {
    this.contactService.changeContact(this.contact);
    this.router.navigate(['upload']);

  }
}