import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { Chart, registerables, ChartConfiguration, TooltipItem, ScatterDataPoint, BubbleDataPoint } from 'chart.js';
import { ContactService } from '../../../services/contact.service';
import { DataService } from '../../../services/data.service';
import { LoggerService } from '../../../services/logger.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

// Place this import at the top of your file
import 'chartjs-adapter-date-fns';


// Register Chart.js components
Chart.register(...registerables);
@Component({
  selector: 'app-app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app-activity.component.html',
  styleUrl: './app-activity.component.css'
})
export class AppActivityComponent implements OnInit, OnDestroy {

  private userSubsription!: Subscription;
  private userId!: string;

  @ViewChild('barChart') private barChartCanvasRef!: ElementRef<HTMLCanvasElement>;
  private barChart!: Chart;

 isLoading = true; // Add this property to control the spinner

  constructor(private authService: AuthService, private router: Router, private contactService: ContactService, private dataService: DataService, private logger: LoggerService) { }



  ngOnInit(): void {
    this.userSubsription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.startUp();
    })

  }

  ngOnDestroy(): void {
    this.userSubsription.unsubscribe();
  }

  startUp(): void {
    this.dataService.getCollectionData('AUDITLOGS', this.userId).then(data => {
      if (data && data.length > 0) {
        const lineChartData = this.processDataForStackedBarChart(data);
        if (lineChartData.datasets && lineChartData.datasets.length > 0) { // Check the length of datasets array
          setTimeout(() => {
            this.createStackedBarChart(lineChartData);
          }, 1000);
        }
      }
    })
  }


  private processDataForStackedBarChart(data: any[]): { datasets: any[], labels: string[] } {
    const actionCountsByDay = new Map<string, Map<string, number>>();
  
    data.forEach(entry => {
      const date = this.parseCustomTimestamp(entry.timestamp).toISOString().split('T')[0];
      const actionParts = entry.action.split(' ');
      const action = actionParts.slice(3).join(' ');
  
      if (!actionCountsByDay.has(date)) {
        actionCountsByDay.set(date, new Map<string, number>());
      }
  
      const counts = actionCountsByDay.get(date);
      if (counts) {
        counts.set(action, (counts.get(action) || 0) + 1);
      }
    });
  
    const dates = Array.from(actionCountsByDay.keys()).sort();
    let allActions = new Set<string>();
    actionCountsByDay.forEach(actionsMap => {
      actionsMap.forEach((_, action) => allActions.add(action));
    });
  
    const datasets = Array.from(allActions).map(action => {
      const color = this.getRandomColor(); // Get a base color
      const backgroundColor = this.convertToRGBA(color, 0.5); // Convert color to RGBA with 50% transparency
      const borderColor = color; // Use the same color but fully opaque for the border
      const data = dates.map(date => {
        const counts = actionCountsByDay.get(date);
        return counts && counts.has(action) ? counts.get(action) : 0;
      });
  
      return {
        label: action,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2
      };
    });
  
    return { datasets, labels: dates };
  }
  
  private convertToRGBA(hex: string, alpha: number): string {
    // Assuming input like '#RRGGBB'
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  



  parseCustomTimestamp(timestamp: any): Date {
    // Check if timestamp is already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // Handle Firestore Timestamp objects
    if (timestamp && typeof timestamp.seconds === 'number') {
      // Convert Firestore Timestamp to JavaScript Date
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }

    // Check if timestamp is a string and process it
    if (typeof timestamp === 'string') {
      const parts = timestamp.split(' ');
      const datePart = parts.slice(0, 3).join(' ');
      const timePart = parts[4];
      const amPm = parts[5];
      const timeZoneOffset = parts[6];

      // Construct a standard date string "May 9, 2024 08:10:39 PM"
      const standardDateStr = `${datePart} ${timePart} ${amPm}`;

      // Create a date object from the standard date string
      const date = new Date(standardDateStr);

      // Adjust for the timezone offset if necessary
      if (timeZoneOffset.startsWith('UTC')) {
        const offset = parseInt(timeZoneOffset.substring(3));
        date.setHours(date.getHours() - offset);
      }

      return date;
    }

    // If the input is neither a Date object, string, nor a valid Firestore timestamp, log an error and return the current date
    console.error('Invalid timestamp format:', timestamp);
    return new Date(); // Fallback to current date, but you might handle this differently
  }




  private getRandomColor(): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  





  private createStackedBarChart(chartData: { datasets: any[], labels: string[] }): void {
    const context = this.barChartCanvasRef.nativeElement.getContext('2d');
    if (!context) {
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    const chartConfiguration: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem: TooltipItem<'bar'>) {
                const label = tooltipItem.dataset.label;
                const value = tooltipItem.raw as number;
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    };

    this.barChart = new Chart(context, chartConfiguration);
  }








}
