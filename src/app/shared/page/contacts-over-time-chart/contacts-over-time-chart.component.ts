import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Contact } from '../../data/interfaces/contact.model';
import { Chart, registerables } from 'chart.js';
import { LoggerService } from '../../../services/logger.service';



@Component({
  selector: 'app-contacts-over-time-chart',
  standalone: true,
  imports: [],
  templateUrl: './contacts-over-time-chart.component.html',
  styleUrl: './contacts-over-time-chart.component.css'
})
export class ContactsOverTimeChartComponent implements OnInit, OnDestroy {

  @ViewChild('contactsOverTimeChart') private contactsOverTimeChartRef!: ElementRef<HTMLCanvasElement>;
  contactsOverTimeChart!: Chart;
  private chartData: any[] = [];

  @Input() contacts!: Contact[];

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    // Process data for the bar chart
    this.chartData = this.processData();
    // Initialize the bar chart if data is available
    if (this.chartData.length > 0) {
      setTimeout(() => {
        this.createBarChart(this.chartData);
      }, 0);
    }

  }

  ngOnDestroy(): void {
    if (this.contactsOverTimeChart) {
      this.contactsOverTimeChart.destroy();
    }

  }

  processData(): any {
    // this.logger.log("Received contacts:", contacts);
    const dateCounts = new Map();

    this.contacts.forEach(contact => {
      let formattedDate;

      // Check if dateAdded is an object with seconds (timestamp)
      if (contact.dateAdded && typeof contact.dateAdded === 'object' && 'seconds' in contact.dateAdded) {
        const date = new Date((contact.dateAdded as { seconds: number }).seconds * 1000);
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


}
