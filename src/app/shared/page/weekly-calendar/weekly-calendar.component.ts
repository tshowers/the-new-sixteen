import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Contact } from '../../data/interfaces/contact.model';
import { ContactService } from '../../../services/contact.service';

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './weekly-calendar.component.html',
  styleUrl: './weekly-calendar.component.css'
})
export class WeeklyCalendarComponent implements OnChanges {
  @Input() weekData!: any[] | null; 
  month!: string;

  constructor(private router: Router, private contactService: ContactService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weekData'] && this.weekData) {
      console.log("WeeklyCalendarComponent", this.weekData);
      this.updateMonthHeader();
    }
  }

  private updateMonthHeader(): void {
    if (this.weekData && this.weekData.length > 0) {
      this.month = new Date(this.weekData[0].date).toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  }

  public onView(contact: Contact): void {
    this.contactService.changeContact(contact);
    this.router.navigate(['/contact-edit']);  // Adjust the route as needed    
  }

}
