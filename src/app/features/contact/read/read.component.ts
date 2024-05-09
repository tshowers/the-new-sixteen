import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-read',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read.component.html',
  styleUrl: './read.component.css'
})
export class ReadComponent implements OnInit {

  @Input() contact?: Contact;
  userId!: string;
  userSubscription!: Subscription;

  communicationLogged: { [key: string]: boolean } = {};


  constructor(private dataService: DataService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }


  logCommunication(contactId: string): void {
    const newCommunication: Communication = {
      contactId: contactId,
      date: new Date().toISOString() // Use ISO string for consistent time formatting
    };

    this.dataService.addDocument('COMMUNICATIONS', newCommunication, this.userId)
      .then(() => {
        console.log('Communication logged successfully');
        this.communicationLogged[contactId] = true;  // Disable the button

        // Update lastContacted field
        if (this.contact) {
          this.setRecordState();
          // Save this change to your backend
          this.dataService.updateDocument('CONTACTS', contactId, this.contact, this.userId)
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
