import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { Chart, registerables } from 'chart.js';
import { Contact, Interaction, ConnectionDetail, Engagement, Communication, SuggestedContact } from '../../../shared/data/interfaces/contact.model';
import { ReadComponent } from '../read/read.component';
import { ContactService } from '../../../services/contact.service';
import { DataService } from '../../../services/data.service';
import { LoggerService } from '../../../services/logger.service';
import { ContactCard1Component } from '../../../shared/page/contact-card-1/contact-card-1.component';
import { ContactCard3Component } from '../../../shared/page/contact-card-3/contact-card-3.component';
import { WeeklyCalendarComponent } from '../../../shared/page/weekly-calendar/weekly-calendar.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

import { ContentInteractionChartComponent } from '../../../shared/page/content-interaction-chart/content-interaction-chart.component';
import { EngagementChartComponent } from '../../../shared/page/engagement-chart/engagement-chart.component';
import { InfluenceAnalysisChartComponent } from '../../../shared/page/influence-analysis-chart/influence-analysis-chart.component';
import { SentimentAnalysisChartComponent } from '../../../shared/page/sentiment-analysis-chart/sentiment-analysis-chart.component';
import { ChatWidgetComponent } from '../../../shared/page/chat-widget/chat-widget.component';
// Register Chart.js components
Chart.register(...registerables);


const chartColors = [
  { backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)' },
  { backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)' },
  { backgroundColor: 'rgba(255, 206, 86, 0.2)', borderColor: 'rgba(255, 206, 86, 1)' },
  { backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' },
  { backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgba(153, 102, 255, 1)' },
  { backgroundColor: 'rgba(255, 159, 64, 0.2)', borderColor: 'rgba(255, 159, 64, 1)' },
  { backgroundColor: 'rgba(233, 30, 99, 0.2)', borderColor: 'rgba(233, 30, 99, 1)' },
  { backgroundColor: 'rgba(32, 76, 255, 0.2)', borderColor: 'rgba(32, 76, 255, 1)' },
  { backgroundColor: 'rgba(165, 214, 167, 0.2)', borderColor: 'rgba(165, 214, 167, 1)' },
  { backgroundColor: 'rgba(255, 87, 34, 0.2)', borderColor: 'rgba(255, 87, 34, 1)' },
  { backgroundColor: 'rgba(176, 190, 197, 0.2)', borderColor: 'rgba(176, 190, 197, 1)' },
  { backgroundColor: 'rgba(118, 255, 3, 0.2)', borderColor: 'rgba(118, 255, 3, 1)' },
  { backgroundColor: 'rgba(0, 150, 136, 0.2)', borderColor: 'rgba(0, 150, 136, 1)' },
  { backgroundColor: 'rgba(255, 235, 59, 0.2)', borderColor: 'rgba(255, 235, 59, 1)' }
];

@Component({

  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, ReadComponent, ContactCard1Component, ContactCard3Component, WeeklyCalendarComponent,
    ContentInteractionChartComponent, InfluenceAnalysisChartComponent, SentimentAnalysisChartComponent, EngagementChartComponent, ChatWidgetComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('queryInput') queryInput!: ElementRef<HTMLInputElement>;

  suggestedContact!: SuggestedContact;

  @ViewChild('contactsOverTimeChart') private contactsOverTimeChartRef!: ElementRef<HTMLCanvasElement>;
  contactsOverTimeChart!: Chart;


  @ViewChild('contactsByTypeChart') private contactsByTypeChartRef!: ElementRef<HTMLCanvasElement>;
  contactsByTypeChart!: Chart<"pie", number[], string>;

  @ViewChild('timezonesChart') private timezonesChartRef!: ElementRef<HTMLCanvasElement>;
  timezonesChart!: Chart;

  @ViewChild('networkHealthChart') private networkHealthChartRef!: ElementRef<HTMLCanvasElement>;
  networkHealthChart!: Chart;

  @ViewChild('lastContactTimelineChart') private lastContactTimelineChartRef!: ElementRef<HTMLCanvasElement>;
  lastContactTimelineChart!: Chart;

  @ViewChild('communicationFrequencyChart') private communicationFrequencyChartRef!: ElementRef<HTMLCanvasElement>;
  communicationFrequencyChart!: Chart;

  @ViewChild('acquisitionSourceChart') private acquisitionSourceChartRef!: ElementRef<HTMLCanvasElement>;
  acquisitionSourceChart!: Chart;

  @ViewChild('professionChart') private professionChartRef!: ElementRef<HTMLCanvasElement>;
  professionChart!: Chart<"pie", number[], string>;

  @ViewChild('genderChart') private genderChartRef!: ElementRef<HTMLCanvasElement>;
  genderChart!: Chart<"pie", number[], string>;

  @ViewChild('responseTimeChart') private responseTimeChartRef!: ElementRef<HTMLCanvasElement>;
  responseTimeChart!: Chart;

  @ViewChild('missingDataChart') private missingDataChartRef!: ElementRef<HTMLCanvasElement>;
  missingDataChart!: Chart;


  // @ViewChild('priorityContactsChart') private priorityContactsChartRef!: ElementRef<HTMLCanvasElement>;
  // priorityContactsChart!: Chart;

  month!: any;
  weeklyChartData = new BehaviorSubject<any[]>([]);

  healthScore: number = 0;  // Default to 0, update this value as you calculate the health score

  private chartData: any[] = [];

  private userSubsription!: Subscription;
  private userId!: string;
  dashboardCounts: any;
  isContacts: boolean = false;
  contacts!: Contact[];
  communication!: Communication[];

  constructor(private authService: AuthService, private router: Router, private contactService: ContactService, private dataService: DataService, private logger: LoggerService) { }



  ngOnInit(): void {
    this.userSubsription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.startUp();
    })

  }

  startUp(): void {
    const periodStartDate = new Date();
    periodStartDate.setDate(periodStartDate.getDate() - 30);

    this.dataService.getCollectionData('CONTACTS', this.userId)
      .then(data => this.initializeContactsData(data, periodStartDate))
      .catch(error => this.handleError(error));
  }

  private initializeContactsData(data: any, periodStartDate: Date): void {
    if (data && data.length > 0) {
      const contacts: Contact[] = (data as Contact[]).filter(contact => contact.userId !== this.userId);
      this.contacts = contacts;      

      if (contacts && contacts.length > 0) {

        this.dataService.getCollectionData('COMMUNICATIONS', this.userId)
          .then(communicationsData =>{ 
            this.communication = communicationsData as Communication[];
            this.initializeCommunicationsData(contacts, communicationsData as Communication[], periodStartDate)})
          .catch(err => this.logger.error("Failed to load communications:", err));
        }

        this.dashboardCounts = this.getDashboardCounts(contacts);
        this.isContacts = true;
        this.initializeBarChart(contacts);
        this.initializeMissingData(contacts);
        this.initializePieChart(contacts);
        this.initializeTimezoneData(contacts);
        this.initializeNetworkHealthData(contacts);
        this.initializeLastContactData(contacts);
        this.initializeAcquisitionSourceData(contacts);
        this.initializeGenderChartData(contacts);
        this.initializeProfessionChartData(contacts);
    }
  }

  private initializeCommunicationsData(contacts: Contact[], communicationsData: any[], periodStartDate: Date): void {
    // Ensure the data conforms to the Communication interface
    const validCommunicationsData: Communication[] = communicationsData.filter(data =>
      data.contactId && data.date
    );

    const communicationFrequencyData = this.processCommunicationFrequency(contacts, validCommunicationsData, periodStartDate);
    if (communicationFrequencyData.length > 0) {
      setTimeout(() => this.createCommunicationFrequencyChart(communicationFrequencyData), 0);
    }

    if (contacts && contacts.length > 0)
      this.suggestedContact = this.contactService.getSuggestedContact(contacts, validCommunicationsData, []);
  }

  private initializeBarChart(contacts: Contact[]): void {
    this.chartData = this.processData(contacts);
    if (this.chartData.length > 0) {
      setTimeout(() => this.createBarChart(this.chartData), 0);
    }
  }

  private initializeMissingData(contacts: Contact[]): void {
    const { missingData, healthScore } = this.calculateDataHealth(contacts);
    this.healthScore = healthScore;
    if (missingData.size > 0) {
      setTimeout(() => this.createMissingDataChart(missingData), 0);
    } else {
      this.logger.log("No missing data to display.");
    }
  }

  private initializePieChart(contacts: Contact[]): void {
    const pieChartData = this.processProfileTypes(contacts);
    if (pieChartData.length > 0) {
      setTimeout(() => this.createProfileTypeChart(pieChartData), 0);
    }
  }

  private initializeTimezoneData(contacts: Contact[]): void {
    const timezoneData = this.processTimezoneData(contacts);
    if (timezoneData.length > 0) {
      setTimeout(() => this.createTimezoneChart(timezoneData), 0);
    }
  }

  private initializeNetworkHealthData(contacts: Contact[]): void {
    const healthScoreData = this.processNetworkHealthData(this.generateRandomSample(contacts));
    if (healthScoreData.length > 0) {
      setTimeout(() => this.createNetworkHealthChart(healthScoreData), 0);
    }
  }

  private initializeLastContactData(contacts: Contact[]): void {
    const lastContactData = this.processLastContactData(contacts);
    this.logger.info("Data prepared for createLastContactTimelineChart", contacts);
    if (lastContactData.length > 0) {
      setTimeout(() => this.createLastContactTimelineChart(lastContactData), 0);
    }
  }

  private initializeAcquisitionSourceData(contacts: Contact[]): void {
    const acquisitionSourceData = this.processContactAcquisitionData(contacts);
    if (acquisitionSourceData.length > 0) {
      setTimeout(() => this.createAcquisitionSourceChart(acquisitionSourceData), 0);
    }
  }

  private initializeGenderChartData(contacts: Contact[]): void {
    const genderChartData = this.processGenderData(contacts);
    if (genderChartData.length > 0) {
      setTimeout(() => this.createGenderChart(genderChartData), 0);
    }
  }

  private initializeProfessionChartData(contacts: Contact[]): void {
    const professionChartData = this.processProfessionData(contacts);
    if (professionChartData.length > 0) {
      setTimeout(() => this.createProfessionChart(professionChartData), 0);
    }
  }

  private handleError(error: any): void {
    this.logger.error("Failed to load contact data:", error);
    this.createBarChart([]);
    this.createProfileTypeChart([]);
    this.createTimezoneChart([]);
    this.createNetworkHealthChart([]);
    this.createLastContactTimelineChart([]);
    this.createCommunicationFrequencyChart([]);
    this.createAcquisitionSourceChart([]);
    this.createProfessionChart([]);
    this.createGenderChart([]);
  }

  submitQuery(): void {

    try {
      const query = this.queryInput.nativeElement.value.trim();  // Use trim() to remove any leading or trailing whitespace
      // this.logger.log('Submitting query:', query);
      if (!query) {  // Check if the query is empty
        this.router.navigate(['/contact-list']);
      } else {
        // Here, you can add logic to handle when there is a query entered.
        this.logger.log('Query provided:', query);
      }

    } catch (error) {
      this.router.navigate(['/contact-list']);
    }

  }

  ngOnDestroy() {
    if (this.contactsOverTimeChart) {
      this.contactsOverTimeChart.destroy();
    }
    if (this.contactsByTypeChart) {
      this.contactsByTypeChart.destroy();
    }
    if (this.timezonesChart) {
      this.timezonesChart.destroy();
    }
    if (this.networkHealthChart) {
      this.networkHealthChart.destroy();
    }
    if (this.lastContactTimelineChart) {
      this.lastContactTimelineChart.destroy();
    }
    if (this.communicationFrequencyChart) {
      this.communicationFrequencyChart.destroy();
    }

    if (this.acquisitionSourceChart) {
      this.acquisitionSourceChart.destroy();
    }
    if (this.professionChart) {
      this.professionChart.destroy();
    }
    if (this.genderChart) {
      this.genderChart.destroy();
    }
    if (this.responseTimeChart) {
      this.responseTimeChart.destroy();
    }
    // if (this.priorityContactsChart) {
    //   this.priorityContactsChart.destroy();
    // }

    if (this.missingDataChart) {
      this.missingDataChart.destroy();
    }

  }


  navigateToEditContact(): void {
    this.contactService.resetContact();
    this.router.navigate(['contact-edit']);
  }

  navigateToImport(): void {
    this.router.navigate(['contact-import']);
  }

  navigateToList(): void {
    this.router.navigate(['contact-list']);
  }



  processData(contacts: any[]): any {
    // this.logger.log("Received contacts:", contacts);
    const dateCounts = new Map();

    contacts.forEach(contact => {
      let formattedDate;

      // Check if dateAdded is an object with seconds (timestamp)
      if (contact.dateAdded && typeof contact.dateAdded === 'object' && 'seconds' in contact.dateAdded) {
        const date = new Date(contact.dateAdded.seconds * 1000);
        formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      // Check if dateAdded is a string (ISO date)
      else if (contact.dateAdded && typeof contact.dateAdded === 'string') {
        const date = new Date(contact.dateAdded);
        formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      // Handle missing or invalid dateAdded field
      else {
        this.logger.error('Missing or invalid dateAdded field for contact:', contact);
        return; // Skip this iteration
      }

      // Increment the count for the formatted date
      dateCounts.set(formattedDate, (dateCounts.get(formattedDate) || 0) + 1);
    });

    // this.logger.log("Date counts:", Array.from(dateCounts.entries()));
    return Array.from(dateCounts, ([date, count]) => ({ date, count }));
  }


  // processProfileTypes(contacts: any[]): any {
  //   const typeCounts = new Map();
  //   contacts.forEach(contact => {
  //     contact.profileTypes.forEach((type: string) => {
  //       if (typeCounts.has(type)) {
  //         typeCounts.set(type, typeCounts.get(type) + 1);
  //       } else {
  //         typeCounts.set(type, 1);
  //       }
  //     });
  //   });
  //   this.logger.log("Profile Type Counts:", Array.from(typeCounts.entries())); // For debugging
  //   return Array.from(typeCounts, ([type, count]) => ({ type, count }));
  // }

  processProfileTypes(contacts: any[]): any {
    const typeCounts = new Map();

    if (Array.isArray(contacts)) {
      contacts.forEach(contact => {
        // Check if profileTypes exists and is an array
        if (Array.isArray(contact.profileTypes)) {
          contact.profileTypes.forEach((type: string) => {
            if (typeCounts.has(type)) {
              typeCounts.set(type, typeCounts.get(type) + 1);
            } else {
              typeCounts.set(type, 1);
            }
          });
        } else {
          // If profileTypes is undefined or not an array, handle gracefully
          // this.logger.warn('Warning: profileTypes is undefined or not an array for contact:', contact.id);
        }
      });
    } else {
      this.logger.error('Error: contacts is undefined or not an array');
      return []; // Return an empty array or handle the error as appropriate
    }

    // this.logger.log("Profile Type Counts:", Array.from(typeCounts.entries())); // For debugging
    return Array.from(typeCounts, ([type, count]) => ({ type, count }));
  }



  processTimezoneData(contacts: any[]): any {
    const timezoneCounts = new Map();
    
    contacts.forEach(contact => {
      const timezone = contact.timezone;
      if (timezone) {
        // Extract the abbreviation inside parentheses
        const matches = timezone.match(/\(([^)]+)\)/);
        const abbreviation = matches ? matches[1] : 'Unknown';
  
        if (timezoneCounts.has(abbreviation)) {
          timezoneCounts.set(abbreviation, timezoneCounts.get(abbreviation) + 1);
        } else {
          timezoneCounts.set(abbreviation, 1);
        }
      }
    });
  
    return Array.from(timezoneCounts, ([timezone, count]) => ({ timezone, count }));
  }
  



  createBarChart(data: any[]): void {
    // this.logger.log("createBarChart Chart data:", data);
    const canvas = this.contactsOverTimeChartRef.nativeElement;


    if (this.contactsOverTimeChart)
      this.contactsOverTimeChart.destroy();

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.contactsOverTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Contacts Added',
            data: data.map(d => d.count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts Added Over Time'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }

  createProfileTypeChart(data: any[]): void {
    const canvas = this.contactsByTypeChartRef.nativeElement;
    const ctx = canvas.getContext('2d');


    if (this.contactsByTypeChart)
      this.contactsByTypeChart.destroy();

    if (ctx) {
      this.contactsByTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.type),
          datasets: [{
            label: 'Contacts by Type',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              // Add more colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // Add more borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts by Type'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }

  createTimezoneChart(data: any[]): void {
    const canvas = this.timezonesChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.timezonesChart)
      this.timezonesChart.destroy();

    if (ctx) {
      this.timezonesChart = new Chart(ctx, {
        type: 'bar',  // You can also consider using 'pie' for visual variety
        data: {
          labels: data.map(d => d.timezone),
          datasets: [{
            label: 'Contacts by US Timezone',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              // add more colors for each timezone
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // add more border colors corresponding to backgroundColors
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contacts by US Timezones'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }

  processNetworkHealthData(contacts: any[]): any {
    return contacts.map(contact => {
      let score = 0;
      let factors = 0;

      if (contact.interactions) {
        score += this.calculateInteractionScore(contact.interactions);
        factors++;
      }

      if (contact.engagements) {
        score += this.calculateEngagementScore(contact.engagements);
        factors++;
      }

      if (contact.connectionDetails) {
        score += this.calculateConnectionDetailScore(contact.connectionDetails);
        factors++;
      }

      // Only average the score if one or more factors were actually calculated
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        score: factors > 0 ? score / factors : 0
      };
    });
  }

  calculateInteractionScore(interactions: Interaction[]): number {
    // Implement logic based on interaction frequency, type, etc.
    return interactions.length; // Simple example: score by number of interactions
  }

  calculateEngagementScore(engagements: Engagement[]): number {
    // Implement logic based on response time, outcome, etc.
    return engagements.reduce((total, next) => total + next.engagementLevel, 0) / engagements.length;
  }

  calculateConnectionDetailScore(details: ConnectionDetail): number {
    // Implement logic based on mutual connections, transaction history, etc.
    let score = 0;
    score += details.mutualConnections;
    score += details.transactionHistory.length; // Simple example
    return score;
  }

  createNetworkHealthChart(data: any[]): void {
    const canvas = this.networkHealthChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.networkHealthChart)
      this.networkHealthChart.destroy();

    if (ctx) {
      this.networkHealthChart = new Chart(ctx, {
        type: 'bar', // or 'line', 'radar', etc., depending on your preference
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Network Strength Score',
            data: data.map(d => d.score),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 10 // Assuming scores are normalized to a max of 10
            }
          },
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Network Strength Score'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context for Network Strenth Chart');
    }
  }

  generateRandomSample(contacts: any[], sampleSize: number = 15): any[] {
    const shuffled = contacts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }



  processLastContactData(contacts: any[]): any[] {
    const today = new Date();
    return contacts.map(contact => {
      let lastContactDate: Date;
      if (contact.lastContacted) {
        lastContactDate = new Date(contact.lastContacted);
      } else if (contact.dateAdded) {
        lastContactDate = new Date(contact.dateAdded);
      } else {
        lastContactDate = new Date(); // Default to current date if neither is available
      }
  
      const daysSinceLastContact = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
  
      const result = {
        name: `${contact.firstName} ${contact.lastName}`,
        daysSinceLastContact: daysSinceLastContact,
      };
  
      // console.log('Processed Contact:', result, 'Raw dateAdded:', contact.dateAdded);
      return result;
    }).sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact) // Sort by days since last contact
      .slice(0, 25); // Take only the top 25
  }
  
  
  
  
  createLastContactTimelineChart(data: any[]): void {
    // console.log('Data prepared for createLastContactTimelineChart', data);
    // data.forEach(d => {
    //   console.log('Name:', d.name, 'Days Since Last Contact:', d.daysSinceLastContact);
    // });
  
    const canvas = this.lastContactTimelineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
  
    if (this.lastContactTimelineChart) {
      this.lastContactTimelineChart.destroy();
    }
  
    if (ctx) {
      this.lastContactTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Days Since Last Contact',
            data: data.map(d => d.daysSinceLastContact),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              type: 'category'
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return `${value} days`; // Label in days
                }
              }
            }
          },
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Days Since Last Contact'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }
  
  
  
  
  
  


  processCommunicationFrequency(contacts: any[], communications: Communication[], periodStartDate: Date): any[] {
    const periodStart = periodStartDate.getTime();
    // Explicitly typing the object to avoid TypeScript errors
    const communicationCounts: Record<string, number> = {}; // A map from contactId to count

    communications.forEach(communication => {
      if (new Date(communication.date).getTime() >= periodStart) {
        if (communicationCounts[communication.contactId]) {
          communicationCounts[communication.contactId]++;
        } else {
          communicationCounts[communication.contactId] = 1;
        }
      }
    });

    // Map the counts to the contacts
    return contacts.map(contact => ({
      name: `${contact.firstName} ${contact.lastName}`,
      frequency: communicationCounts[contact.id] || 0 // Use || 0 to handle undefined cases
    }));
  }


  createCommunicationFrequencyChart(data: any[]): void {
    const canvas = this.communicationFrequencyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.communicationFrequencyChart)
      this.communicationFrequencyChart.destroy();

    if (ctx) {
      this.communicationFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Communication Frequency',
            data: data.map(d => d.frequency),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0 // Ensures that the scale only includes whole numbers
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
              text: 'Communication Frequency Over Specified Period'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context for Communication Frequency Chart');
    }
  }



  processContactAcquisitionData(contacts: any[]): any {
    let sourceCounts: Record<string, number> = {};

    contacts.forEach(contact => {
      let source = contact.acquisitionSource || 'Unknown';  // Default to 'Unknown' if not specified
      if (sourceCounts[source]) {
        sourceCounts[source]++;
      } else {
        sourceCounts[source] = 1;
      }
    });

    return Object.keys(sourceCounts).map(key => ({
      source: key,
      count: sourceCounts[key]
    }));
  }

  createAcquisitionSourceChart(data: any[]): void {
    const canvas = this.acquisitionSourceChartRef.nativeElement;

    if (this.acquisitionSourceChart)
      this.acquisitionSourceChart.destroy();

    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.acquisitionSourceChart = new Chart(ctx, {
        type: 'bar',  // Using a bar chart for consistency
        data: {
          labels: data.map(d => d.source),  // The sources of acquisition
          datasets: [{
            label: 'Contact Acquisition Sources',
            data: data.map(d => d.count),  // The count of contacts per source
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              // More colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              // More borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0  // Ensures that the scale only includes whole numbers
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
              text: 'Contact Acquisition Sources'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context for Acquisition Source Chart');
    }
  }

  processProfessionData(contacts: any[]): any {
    const professionCounts = new Map();

    contacts.forEach(contact => {
      const profession = contact.profession || 'Unknown'; // Handle undefined professions
      if (professionCounts.has(profession)) {
        professionCounts.set(profession, professionCounts.get(profession) + 1);
      } else {
        professionCounts.set(profession, 1);
      }
    });

    // this.logger.log("Profession Counts:", Array.from(professionCounts.entries())); // For debugging
    return Array.from(professionCounts, ([profession, count]) => ({ profession, count }));
  }

  processGenderData(contacts: any[]): any {
    const genderCounts = new Map();

    contacts.forEach(contact => {
      const gender = contact.gender || 'Unknown'; // Handle undefined genders
      if (genderCounts.has(gender)) {
        genderCounts.set(gender, genderCounts.get(gender) + 1);
      } else {
        genderCounts.set(gender, 1);
      }
    });

    // this.logger.log("Gender Counts:", Array.from(genderCounts.entries())); // For debugging
    return Array.from(genderCounts, ([gender, count]) => ({ gender, count }));
  }





  createProfessionChart(data: any[]): void {
    const canvas = this.professionChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.professionChart)
      this.professionChart.destroy();

    if (ctx) {
      this.professionChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.profession),
          datasets: [{
            label: 'Contacts by Profession',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              // Add more colors as needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // Add more borders as needed
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contact Breakdown by Profession'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }



  createGenderChart(data: any[]): void {
    const canvas = this.genderChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.genderChart)
      this.genderChart.destroy();

    if (ctx) {
      this.genderChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(d => d.gender),
          datasets: [{
            label: 'Contacts by Gender',
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              // Additional colors
            ],
            borderColor: [
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              // Additional borders
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contact Breakdown by Gender'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }





  
  
  
  






  assignContactToEarliestAvailableDate(datesWithContacts: Map<string, any[]>, contact: any) {
    for (let [date, contacts] of datesWithContacts) {
      if (contacts.length < 10) {
        contacts.push(contact);
        break;
      }
    }
  }

  // createPriorityContactsChart(data: any[]): void {
  //   this.logger.log('Chart Labels:', data.map(d => d.date));
  //   this.logger.log('Chart Data:', data.map(d => d.contacts ? d.contacts.length : 0));
  //       const canvas = this.priorityContactsChartRef.nativeElement;
  //   const ctx = canvas.getContext('2d');

  //   if (this.priorityContactsChart)
  //     this.priorityContactsChart.destroy();

  //   if (ctx) {
  //     this.priorityContactsChart = new Chart(ctx, {
  //       type: 'bar',
  //       data: {
  //         labels: data.map(d => d.date),
  //         datasets: [{
  //           label: 'Planned Contact Count',
  //           data: data.map(d => d.contacts ? d.contacts.length : 0),  // Ensuring contacts are defined
  //           backgroundColor: chartColors.map(color => color.backgroundColor),
  //           borderColor: chartColors.map(color => color.borderColor),
  //           borderWidth: 1
  //         }]
  //       },
  //       options: {
  //         scales: {
  //           y: {
  //             beginAtZero: true,
  //             ticks: {
  //               stepSize: 1  // Since we are counting contacts
  //             }
  //           }
  //         },
  //         responsive: true,
  //         maintainAspectRatio: true,
  //         plugins: {
  //           legend: {
  //             display: false,
  //             position: 'top',
  //           },
  //           title: {
  //             display: true,
  //             text: 'Contact Prioritization for Next 14 Days'
  //           }
  //         }
  //       }
  //     });
  //   } else {
  //     console.error('Failed to get canvas context');
  //   }
  // }



  calculateDataHealth(contacts: Contact[]): { missingData: Map<string, number>, healthScore: number } {
    let missingLastName = 0, missingFirstName = 0, missingCompany = 0, missingProfession = 0;
    let missingProfileTypes = 0, missingGender = 0, missingAddresses = 0, missingPhoneNumbers = 0;
    let missingEmailAddresses = 0, missingSocialMedia = 0, missingCompanyName = 0, missingCompanyCapabilities = 0;
    let missingTimezone = 0; // Counter for missing timezones

    contacts.forEach(contact => {
      if (!contact.firstName) missingFirstName++;
      // Check if lastName is either missing or set to the default placeholder
      if (!contact.lastName || contact.lastName === "No Last Name") missingLastName++;
      // Check if the company object exists; then check name and capabilities separately
      if (!contact.company) {
        missingCompanyName++;
        missingCompanyCapabilities++; // Assuming if there's no company object, capabilities are also missing
      } else {
        // Check for company name
        if (!contact.company.name || contact.company.name === "Unknown Company") {
          missingCompanyName++;
        }
        // Check for company capabilities independently
        if (!contact.company.capabilities) {
          missingCompanyCapabilities++;
        }
      }


      if (!contact.profession) missingProfession++;
      if (!contact.profileTypes || contact.profileTypes.length === 0) missingProfileTypes++;
      if (!contact.gender) missingGender++;
      if (!contact.addresses || contact.addresses.length === 0) missingAddresses++;
      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) missingPhoneNumbers++;
      if (!contact.emailAddresses || contact.emailAddresses.length === 0) missingEmailAddresses++;
      if (!contact.socialMedia || contact.socialMedia.length === 0) missingSocialMedia++;
      if (!contact.timezone) missingTimezone++; // Check for missing timezone
    });

    const missingData = new Map<string, number>([
      ['Last Name', missingLastName],
      ['First Name', missingFirstName],
      ['Company', missingCompany],
      ['Company Name', missingCompanyName],
      ['Company Capabilities', missingCompanyCapabilities],
      ['Profession', missingProfession],
      ['Profile Types', missingProfileTypes],
      ['Gender', missingGender],
      ['Addresses', missingAddresses],
      ['Phone Numbers', missingPhoneNumbers],
      ['Email Addresses', missingEmailAddresses],
      ['Social Media Profiles', missingSocialMedia],
      ['Timezone', missingTimezone] // Include timezone in the missing data map
    ]);

    // Update the total fields count to include the timezone field
    const totalFields = contacts.length * 13; // Now checking 13 fields per contact
    const totalMissing = Array.from(missingData.values()).reduce((sum, count) => sum + count, 0);
    const healthScore = ((totalFields - totalMissing) / totalFields) * 100;
    // Convert the Map to an array of key-value pairs
    const missingDataArray = Array.from(missingData.entries());

    // Now log the array, which JSON.stringify can handle
    // this.logger.info("Missing Data", JSON.stringify(missingDataArray, null, 2));

    return { missingData, healthScore };
  }


  createMissingDataChart(missingData: Map<string, number>): void {
    const labels = Array.from(missingData.keys());
    const dataPoints = Array.from(missingData.values());
    const canvas = this.missingDataChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.missingDataChart)
      this.missingDataChart.destroy();


    if (ctx) {
      const missingDataChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Missing Data',
            data: dataPoints,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(199, 199, 199, 0.2)',
              'rgba(83, 102, 255, 0.2)',
              'rgba(40, 159, 44, 0.2)',
              'rgba(145, 232, 66, 0.2)',
              'rgba(255, 129, 102, 0.2)',
              'rgba(61, 72, 186, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
              'rgba(40, 159, 44, 1)',
              'rgba(145, 232, 66, 1)',
              'rgba(255, 129, 102, 1)',
              'rgba(61, 72, 186, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Missing Data Overview'
            }
          }
        }
      });
    } else {
      this.logger.error('Failed to get canvas context');
    }
  }

  assignContactToAvailableDate(datesWithContacts: Map<string, any[]>, contact: any) {
    let availableDate = null;
    let minContacts = Number.MAX_VALUE;

    // Find the date with the least number of assigned contacts
    datesWithContacts.forEach((contacts, date) => {
      if (contacts.length < minContacts) {
        minContacts = contacts.length;
        availableDate = date;
      }
    });

    // Check if a valid date was found and if the map actually has an entry for this date
    if (availableDate && datesWithContacts.has(availableDate)) {
      const contactsOnDate = datesWithContacts.get(availableDate);
      if (contactsOnDate) {
        contactsOnDate.push(contact);
      }
    } else {
      this.logger.error('No available date found or date is not in the map', availableDate);
    }
  }

  getDashboardCounts(contacts: Contact[]): any {
    const totalContacts = contacts?.length || 0;
    const today = new Date().toISOString().split('T')[0];

    const contactsAddedToday = contacts?.filter(contact => {
      let dateAdded: Date;
      if (contact?.dateAdded && typeof contact.dateAdded === 'object' && 'seconds' in contact.dateAdded) {
        dateAdded = new Date((contact.dateAdded as { seconds: number }).seconds * 1000);
      } else if (typeof contact?.dateAdded === 'string') {
        dateAdded = new Date(contact.dateAdded);
      } else {
        return false; // Handle missing or invalid dateAdded
      }
      return dateAdded.toISOString().split('T')[0] === today;
    }).length || 0;

    const importantContacts = contacts?.filter(contact => contact?.important).length || 0;
    const contactsWithSocialMedia = contacts?.filter(contact => contact?.socialMedia && contact?.socialMedia.length > 0).length || 0;
    const documentsUploaded = contacts?.reduce((count, contact) => count + (contact?.documents?.length || 0), 0) || 0;
    const birthdaysThisMonth = contacts?.filter(contact => {
      const birthday = contact?.birthday ? new Date(contact.birthday) : null;
      return birthday && birthday.getMonth() === new Date().getMonth();
    }).length || 0;

    const profileTypeCounts = this.processProfileTypesCount(contacts) || [];
    const timezoneCounts = this.processTimezoneCount(contacts) || [];

    //TODO
    // const contactsNeedingFollowUp = this.processContactPriorities(contacts, []).length || 0;
    const contactsNeedingFollowUp = 0;
    const missingData = this.calculateDataHealth(contacts)?.missingData || new Map();
    const missingDataCounts = Array.from(missingData.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) || [];

    // this.logger.info("profileTypeCounts", profileTypeCounts);
    // this.logger.info("missingDataCounts", missingDataCounts);

    return {
      totalContacts,
      contactsAddedToday,
      importantContacts,
      contactsWithSocialMedia,
      documentsUploaded,
      birthdaysThisMonth,
      profileTypeCounts,
      timezoneCounts,
      contactsNeedingFollowUp,
      missingDataCounts
    };
  }



  processProfileTypesCount(contacts: Contact[]): any {
    const typeCounts = new Map();

    if (Array.isArray(contacts)) {
      contacts.forEach(contact => {
        if (Array.isArray(contact.profileTypes)) {
          contact.profileTypes.forEach((type: string) => {
            if (typeCounts.has(type)) {
              typeCounts.set(type, typeCounts.get(type) + 1);
            } else {
              typeCounts.set(type, 1);
            }
          });
        }
      });
    }

    return Array.from(typeCounts, ([type, count]) => ({ type, count }));
  }

  processTimezoneCount(contacts: Contact[]): any {
    const timezoneCounts = new Map();
    contacts.forEach(contact => {
      const timezone = contact.timezone;
      if (timezoneCounts.has(timezone)) {
        timezoneCounts.set(timezone, timezoneCounts.get(timezone) + 1);
      } else {
        timezoneCounts.set(timezone, 1);
      }
    });
    return Array.from(timezoneCounts, ([timezone, count]) => ({ timezone, count }));
  }





}
