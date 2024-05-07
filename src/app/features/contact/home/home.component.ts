import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { Chart, registerables } from 'chart.js';
import { Contact, Interaction, ConnectionDetail, Engagement, Communication } from '../../../shared/data/interfaces/contact.model';
import { ReadComponent } from '../read/read.component';
import { ContactService } from '../../../services/contact.service';
import { DataService } from '../../../services/data.service';
import { LoggerService } from '../../../services/logger.service';
import { ContactCard1Component } from '../../../shared/page/contact-card-1/contact-card-1.component';
import { ContactCard3Component } from '../../../shared/page/contact-card-3/contact-card-3.component';
import { WeeklyCalendarComponent } from '../../../shared/page/weekly-calendar/weekly-calendar.component';
import { BehaviorSubject } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

@Component({

  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, ReadComponent, ContactCard1Component, ContactCard3Component, WeeklyCalendarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('queryInput') queryInput!: ElementRef<HTMLInputElement>;

  suggestedContact!: Contact;

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


  @ViewChild('priorityContactsChart') private priorityContactsChartRef!: ElementRef<HTMLCanvasElement>;
  priorityContactsChart!: Chart;

  priorityContactsChartData!: any;
  month!: any;
  weeklyChartData = new BehaviorSubject<any[]>([]);

  healthScore: number = 0;  // Default to 0, update this value as you calculate the health score

  private chartData: any[] = [];

  constructor(private router: Router, private contactService: ContactService, private dataService: DataService, private logger: LoggerService) { }



  ngOnInit(): void {

    const periodStartDate = new Date();
    periodStartDate.setDate(periodStartDate.getDate() - 30);

    this.dataService.getCollectionData('CONTACTS').then(data => {
      if (data && data.length > 0) {
        const contacts: Contact[] = data as Contact[];
        this.suggestedContact = contacts[0];

        this.logger.info("suggestedContact", this.suggestedContact)

        // Process data for the bar chart
        this.chartData = this.processData(data);
        // Initialize the bar chart if data is available
        if (this.chartData.length > 0) {
          setTimeout(() => {
            this.createBarChart(this.chartData);
          }, 0);
        }


        //Process missing data
        const { missingData, healthScore } = this.calculateDataHealth(contacts);
        this.healthScore = healthScore; // Set this value after calculating the health score
        // Check if there is any missing data before creating the chart
        if (missingData.size > 0) {
          setTimeout(() => {
            this.createMissingDataChart(missingData);
            console.log(`Data Health Score: ${healthScore.toFixed(2)}`);
          }, 0); // setTimeout with delay of 0 ms
        } else {
          console.log("No missing data to display.");
        }


        // Process data for the pie chart
        const pieChartData = this.processProfileTypes(data);
        // Initialize the pie chart if data is available
        if (pieChartData.length > 0) {
          setTimeout(() => {
            this.createProfileTypeChart(pieChartData);
          }, 0);
        }

        // Process Time Zone Data
        const timezoneData = this.processTimezoneData(data);
        if (timezoneData.length > 0) {
          setTimeout(() => {
            this.createTimezoneChart(timezoneData);
          }, 0);
        }

        const healthScoreData = this.processNetworkHealthData(this.generateRandomSample(data));
        if (healthScoreData.length > 0) {
          setTimeout(() => {
            this.createNetworkHealthChart(healthScoreData);
          }, 0);
        }


        const lastContactData = this.processLastContactData(data);
        if (lastContactData.length > 0) {
          setTimeout(() => {
            this.createLastContactTimelineChart(lastContactData);
          }, 0);
        }


        const acquisitionSourceData = this.processContactAcquisitionData(data);
        if (acquisitionSourceData.length > 0) {
          setTimeout(() => {
            this.createAcquisitionSourceChart(acquisitionSourceData);
          }, 0);
        }


        const genderChartData = this.processGenderData(data);
        if (genderChartData.length > 0) {
          setTimeout(() => {
            this.createGenderChart(genderChartData);
          }, 0);
        }

        const professionChartData = this.processProfessionData(data);
        if (professionChartData.length > 0) {
          setTimeout(() => {
            this.logger.info("professionChartData", data)
            this.createProfessionChart(professionChartData);
          }, 0);
        }



        this.dataService.getCollectionData('COMMUNICATIONS').catch(err => {
          console.error("Failed to load communications:", err);
          return [] as Communication[];  // Ensure this matches the expected type in then()
        }).then(communicationsData => {
          this.logger.info("getCollectionData('COMMUNICATIONS')", communicationsData)
          // TypeScript should now understand that communicationsData is always Communication[]
          communicationsData = communicationsData as Communication[]; // This assertion may now be redundant
          const communicationFrequencyData = this.processCommunicationFrequency(data, communicationsData, periodStartDate);


          if (communicationFrequencyData.length > 0) {
            setTimeout(() => this.createCommunicationFrequencyChart(communicationFrequencyData), 0);
          }

          this.priorityContactsChartData = this.processContactPriorities(data, communicationsData);

          if (this.priorityContactsChartData.length > 0) {
            console.log("Data for chart:", data);
            setTimeout(() => this.createPriorityContactsChart(this.priorityContactsChartData), 0);
            this.weeklyChartData.next(this.priorityContactsChartData);
          }
        })

      }
    }).catch(error => {
      this.logger.error("Failed to load contact data:", error);
      this.createBarChart([]); // Handle bar chart errors gracefully
      this.createProfileTypeChart([]); // Handle pie chart errors gracefully
      this.createTimezoneChart([]);
      this.createNetworkHealthChart([]);
      this.createLastContactTimelineChart([]);
      this.createCommunicationFrequencyChart([]);
      this.createAcquisitionSourceChart([]);
      this.createProfessionChart([]);
      this.createGenderChart([]);
    });
  }

  determineReason(): string {
    if (!this.suggestedContact) return 'Contact data is not available';

    // Example of determining reason based on lastContacted
    const today = new Date();
    if (this.suggestedContact.lastContacted) {
      const lastContactDate = new Date(this.suggestedContact.lastContacted);
      const diffDays = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays > 30) return 'No contact in the last month';
      if (diffDays > 7) return 'It has been more than a week since last contact';
    }

    // Add more reasons based on your business logic
    // Example: Checking interaction types, activity levels, etc.

    return 'Regular follow-up'; // Default reason
  }

  submitQuery(): void {

    try {
      const query = this.queryInput.nativeElement.value.trim();  // Use trim() to remove any leading or trailing whitespace
      this.logger.log('Submitting query:', query);
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
    if (this.priorityContactsChart) {
      this.priorityContactsChart.destroy();
    }

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


  // processData(contacts: any[]): any {
  //   this.logger.log("Received contacts:", contacts);
  //   const dateCounts = new Map();
  //   contacts.forEach(contact => {
  //     // Check if the dateAdded field and its seconds property exist before proceeding
  //     if (contact.dateAdded && contact.dateAdded.seconds) {
  //       const date = new Date(contact.dateAdded.seconds * 1000);
  //       const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  //       dateCounts.set(formattedDate, (dateCounts.get(formattedDate) || 0) + 1);
  //     } else {
  //       // Log an error or handle the case where dateAdded is missing
  //       this.logger.error('Missing or invalid dateAdded field for contact:', contact);
  //     }
  //   });
  //   this.logger.log("Date counts:", Array.from(dateCounts.entries()));
  //   return Array.from(dateCounts, ([date, count]) => ({ date, count }));
  // }

  processData(contacts: any[]): any {
    this.logger.log("Received contacts:", contacts);
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

    this.logger.log("Date counts:", Array.from(dateCounts.entries()));
    return Array.from(dateCounts, ([date, count]) => ({ date, count }));
  }


  processProfileTypes(contacts: any[]): any {
    const typeCounts = new Map();
    contacts.forEach(contact => {
      contact.profileTypes.forEach((type: string) => {
        if (typeCounts.has(type)) {
          typeCounts.set(type, typeCounts.get(type) + 1);
        } else {
          typeCounts.set(type, 1);
        }
      });
    });
    console.log("Profile Type Counts:", Array.from(typeCounts.entries())); // For debugging
    return Array.from(typeCounts, ([type, count]) => ({ type, count }));
  }

  processTimezoneData(contacts: any[]): any {
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




  createBarChart(data: any[]): void {
    this.logger.log("createBarChart Chart data:", data);
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
      console.error('Failed to get canvas context');
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
      console.error('Failed to get canvas context');
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
      console.error('Failed to get canvas context for Network Strenth Chart');
    }
  }

  generateRandomSample(contacts: any[], sampleSize: number = 15): any[] {
    const shuffled = contacts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }



  processLastContactData(contacts: any[]): any {
    return contacts.map(contact => {
      const lastContactDate = contact.lastContacted ? new Date(contact.lastContacted) : (contact.dateAdded ? new Date(contact.dateAdded.seconds * 1000) : new Date());
      return {
        name: `${contact.firstName} ${contact.lastName}`,
        lastContacted: lastContactDate
      };
    }).sort((a, b) => b.lastContacted.getTime() - a.lastContacted.getTime()) // Sort by most recently contacted
      .slice(0, 25); // Take only the top 25
  }



  createLastContactTimelineChart(data: any[]): void {
    const canvas = this.lastContactTimelineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.lastContactTimelineChart)
      this.lastContactTimelineChart.destroy();

    if (ctx) {
      this.lastContactTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Days since last contact',
            data: data.map(d => {
              const today = new Date();
              const lastContacted = d.lastContacted;
              const timeDiff = today.getTime() - lastContacted.getTime();
              return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Converts time difference to days
            }),
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
      console.error('Failed to get canvas context for Communication Frequency Chart');
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
      console.error('Failed to get canvas context for Acquisition Source Chart');
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

    console.log("Profession Counts:", Array.from(professionCounts.entries())); // For debugging
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

    console.log("Gender Counts:", Array.from(genderCounts.entries())); // For debugging
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
      console.error('Failed to get canvas context');
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
      console.error('Failed to get canvas context');
    }
  }


  processContactPriorities(contacts: any[], communications: any[]): any {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    // Create a map to hold dates and their associated contacts
    const datesWithContacts = new Map();

    // Initialize each day with an empty array
    for (let day = 0; day < 7; day++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + day);
      const formattedDate = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`;
      datesWithContacts.set(formattedDate, []);  // Ensure it's always an array
    }

    // Map to keep track of last communication date for each contact
    const lastCommunicationDates = new Map();
    communications.forEach(communication => {
      const contactDate = new Date(communication.date);
      const contactId = communication.contactId;
      // Update the latest communication date
      if (!lastCommunicationDates.has(contactId) || lastCommunicationDates.get(contactId) < contactDate) {
        lastCommunicationDates.set(contactId, contactDate);
      }
    });

    // Sort contacts by their communication urgency
    contacts.forEach(contact => {
      if (!lastCommunicationDates.has(contact.id)) {
        // If no communication data, high priority
        this.assignContactToEarliestAvailableDate(datesWithContacts, contact);
      } else {
        const lastContactDate = lastCommunicationDates.get(contact.id);
        if (((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)) >= 7) {
          // Contact them again if it's been 7+ days
          this.assignContactToEarliestAvailableDate(datesWithContacts, contact);
        }
      }
    });

    return Array.from(datesWithContacts, ([date, contacts]) => ({ date, contacts: contacts.slice(0, 10) })); // Limit to 10 contacts per day
  }

  assignContactToEarliestAvailableDate(datesWithContacts: Map<string, any[]>, contact: any) {
    for (let [date, contacts] of datesWithContacts) {
      if (contacts.length < 10) {
        contacts.push(contact);
        break;
      }
    }
  }

  createPriorityContactsChart(data: any[]): void {
    this.logger.info("Beginniing createPriorityContactsChart ", data)
    const canvas = this.priorityContactsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (this.priorityContactsChart)
      this.priorityContactsChart.destroy();

    if (ctx) {
      this.priorityContactsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Planned Contact Count',
            data: data.map(d => d.contacts ? d.contacts.length : 0),  // Ensuring contacts are defined
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
                stepSize: 1  // Since we are counting contacts
              }
            }
          },
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Contact Prioritization for Next 7 Days'
            }
          }
        }
      });
    } else {
      console.error('Failed to get canvas context');
    }
  }


  calculateDataHealth(contacts: Contact[]): { missingData: Map<string, number>, healthScore: number } {
    let missingLastName = 0, missingFirstName = 0, missingCompany = 0, missingProfession = 0;
    let missingProfileTypes = 0, missingGender = 0, missingAddresses = 0, missingPhoneNumbers = 0;
    let missingEmailAddresses = 0, missingSocialMedia = 0, missingCompanyName = 0, missingCompanyCapabilities = 0;

    contacts.forEach(contact => {
      if (!contact.lastName) missingLastName++;
      if (!contact.firstName) missingFirstName++;
      if (!contact.company) {
        missingCompany++;
      } else {
        if (!contact.company.name) missingCompanyName++;
        if (!contact.company.capabilities) missingCompanyCapabilities++;
      }
      if (!contact.profession) missingProfession++;
      if (!contact.profileTypes || contact.profileTypes.length === 0) missingProfileTypes++;
      if (!contact.gender) missingGender++;
      if (!contact.addresses || contact.addresses.length === 0) missingAddresses++;
      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) missingPhoneNumbers++;
      if (!contact.emailAddresses || contact.emailAddresses.length === 0) missingEmailAddresses++;
      if (!contact.socialMedia || contact.socialMedia.length === 0) missingSocialMedia++;
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
      ['Social Media Profiles', missingSocialMedia]
    ]);

    // Calculate health score: (total fields - total missing) / total fields * 100
    const totalFields = contacts.length * 12; // Total number of fields checked across all contacts
    const totalMissing = Array.from(missingData.values()).reduce((sum, count) => sum + count, 0);
    const healthScore = ((totalFields - totalMissing) / totalFields) * 100;

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



}
