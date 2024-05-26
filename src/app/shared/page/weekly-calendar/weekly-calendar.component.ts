import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../data/interfaces/contact.model';
import { ContactService } from '../../../services/contact.service';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './weekly-calendar.component.html',
  styleUrl: './weekly-calendar.component.css'
})
export class WeeklyCalendarComponent implements OnInit, OnChanges {
  
  @Input() communications: Communication[] = [];
  @Input() contacts: Contact[] = [];
  month!: string;
  calendarDays: any[] = [];

  constructor(private contactService: ContactService, private logger: LoggerService) {}

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contacts'] || changes['communications']) {
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    const today = new Date();
    this.month = today.toLocaleString('default', { month: 'long' });

    // Start from tomorrow
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);

    // Get the dates for the calendar (next 5 weekdays)
    const dates = this.getNextWeekdays(startDate, 5);
    this.calendarDays = this.processContactPriorities(this.contacts, this.communications, dates);
  }

  getNextWeekdays(start: Date, count: number): Date[] {
    const dates = [];
    let currentDate = new Date(start);
    let addedDays = 0;

    while (addedDays < count) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sundays (0) and Saturdays (6)
        dates.push(new Date(currentDate));
        addedDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  processContactPriorities(contacts: Contact[], communications: Communication[], dates: Date[]): any[] {
    const contactMap = new Map<string, Contact>();
    contacts.forEach(contact => {
      if (contact.id) {
        contactMap.set(contact.id, contact);
      }
    });

    const communicationsMap = new Map<string, Date>();
    communications.forEach(communication => {
      const commDate = new Date(communication.date);
      const contactId = communication.contactId;
      if (contactId && (!communicationsMap.has(contactId) || communicationsMap.get(contactId)! < commDate)) {
        communicationsMap.set(contactId, commDate);
      }
    });

    const followUpContacts: any[] = [];
    const emptyCells = this.calculateEmptyCellsBeforeStart(dates[0]);

    // Fill initial empty cells
    for (let i = 0; i < emptyCells; i++) {
      followUpContacts.push({ date: null, contacts: [] });
    }

    dates.forEach(date => {
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const dayContacts: any[] = [];

      contacts.forEach(contact => {
        if (contact.id && contact.dateAdded) {
          const lastContactDate = communicationsMap.get(contact.id) || new Date(contact.dateAdded);
          const daysSinceLastContact = Math.floor((date.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceLastContact > 14) {
            dayContacts.push({ ...contact, reason: 'Follow-up' });
          }
        }
      });

      if (dayContacts.length === 0) {
        const randomContacts = this.getRandomContacts(contacts, 2);
        followUpContacts.push({ date: formattedDate, contacts: randomContacts });
      } else {
        followUpContacts.push({ date: formattedDate, contacts: dayContacts });
      }
    });

    return followUpContacts;
  }

  calculateEmptyCellsBeforeStart(startDate: Date): number {
    const dayOfWeek = startDate.getDay();
    return dayOfWeek === 0 ? 0 : (dayOfWeek - 1); // Adjust for Monday as the start of the week
  }

  getRandomContacts(contacts: Contact[], count: number): Contact[] {
    const shuffled = [...contacts].sort(() => 0.5 - Math.random());
    const selectedContacts = shuffled.slice(0, count);
    return selectedContacts.map(contact => ({ ...contact, reason: 'Random follow-up' }));
  }
  

  onView(contact: Contact): void {
    this.logger.log('Viewing contact:', contact);
    // Implement navigation or other logic
  }

  

}
