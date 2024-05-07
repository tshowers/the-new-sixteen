import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { Contact, Communication, Interaction } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';
import { ChangeDetectorRef } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
declare var bootstrap: any;

@Component({
  selector: 'app-contact-card-1',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './contact-card-1.component.html',
  styleUrl: './contact-card-1.component.css'
})
export class ContactCard1Component {

  callDetails: Interaction = {
    type: 'Phone Call',
    date: '',
    duration: 0,
    notes: ''
  };

  constructor(private cdr: ChangeDetectorRef, private contactService: ContactService, private router: Router, private dataService: DataService) { }


  @Input() contact?: Contact;

  updateContact(data: Contact) {
    this.contact = data;
    this.cdr.detectChanges();  // Manually trigger change detection
  }


  public onView(): void {
    if (this.contact) {
      this.contactService.changeContact(this.contact);
    }
    this.router.navigate(['/contact-edit']);  // Adjust the route as needed    
  }

  saveInteraction(): void {
    if (this.contact && this.contact.id) {
      if (!this.contact.interactions) {
        this.contact.interactions = [];
      }
      
      this.callDetails.date = new Date().toISOString();
      this.callDetails.notes = this.callDetails.notes + ' - ' + ((this.contact.phoneNumbers && this.contact.phoneNumbers[0].phoneNumber) ? this.contact.phoneNumbers[0].phoneNumber : '');
      this.contact.interactions.push(this.callDetails);

      // Update the contact in the database
      this.dataService.updateDocument('CONTACTS', this.contact.id, { interactions: this.contact.interactions })
        .then(() => {
          // After successful database update, update the local state
          if (this.contact)
            this.contactService.changeContact(this.contact);
          this.resetInteractionForm();
          this.cdr.detectChanges(); // Manually trigger change detection
        })
        .catch(error => console.error('Failed to update contact', error));
    }
  }

  resetInteractionForm(): void {
    this.callDetails = { type: 'Phone Call', date: '', duration: 0, notes: '' };
    document.getElementById('callLogModal')?.classList.remove('show');
    document.querySelector('.modal-backdrop')?.classList.remove('show'); // Remove the modal backdrop
  }

  handleCallAndModal(phoneNumber: string, firstName: string): void {
    // Open the dialer
    const cleanPhoneNumber = this.normalizePhoneNumber(phoneNumber);


    window.open(`tel:${cleanPhoneNumber}`, '_self');
  
    // Use a timeout to delay the modal opening to give the dialer time to activate
    setTimeout(() => {
      const modalElement = document.getElementById('callLogModal');
      const modal = new bootstrap.Modal(modalElement, {
        keyboard: false
      });
      modal.show();
    }, 500); // Delay can be adjusted based on testing
  }

  normalizePhoneNumber(phoneNumber: string): string {
    // Remove anything that is not a number
    return phoneNumber.replace(/\D/g, '');
  }
  
  

}
