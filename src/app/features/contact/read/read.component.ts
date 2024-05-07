import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-read',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read.component.html',
  styleUrl: './read.component.css'
})
export class ReadComponent {

  @Input() contact?: Contact;

  communicationLogged: { [key: string]: boolean } = {};


  constructor(private dataService: DataService) { }


  logCommunication(contactId: string): void {
    const newCommunication: Communication = {
      contactId: contactId,
      date: new Date().toISOString() // Use ISO string for consistent time formatting
    };

    this.dataService.addDocument('COMMUNICATIONS', newCommunication)
      .then(() => {
        console.log('Communication logged successfully');
        this.communicationLogged[contactId] = true;  // Disable the button

        // Update lastContacted field
        if (this.contact) {
          this.setRecordState();
          // Save this change to your backend
          this.dataService.updateDocument('CONTACTS', contactId, this.contact)
            .then(() => console.log('Contact updated successfully', this.contact))
            .catch(error => console.error('Failed to update contact:', error));
        }
      })
      .catch(error => {
        console.error('Failed to log communication:', error);
      });
  }


  setRecordState(): void {
    if (this.contact) {
      this.contact.lastUpdated = new Date().toISOString();
      this.contact.lastViewed = new Date().toISOString();
      this.contact.timeStamp = new Date();
      this.contact.lastContacted = new Date().toISOString();
    }
  }

}
