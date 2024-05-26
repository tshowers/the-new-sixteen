import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmailService } from '../../../services/email.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { Observable, map, startWith, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Contact, EmailAddress } from '../../../shared/data/interfaces/contact.model';


@Component({
  selector: 'app-email-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './email-composer.component.html',
  styleUrl: './email-composer.component.css'
})
export class EmailComposerComponent implements OnInit {
  emailForm: FormGroup;
  contacts: Contact[] = [];
  filteredContacts: string[] = [];
  allEmailAddresses: string[] = [];
  showSuggestions = false;
  userSubscription!: Subscription;

  userId = 'some-user-id'; // Replace with actual user ID


  constructor(private fb: FormBuilder, private dataService: DataService, private emailService: EmailService, private authService: AuthService) {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      text: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.setupContacts();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  setupContacts(): void {
    this.dataService.getCollectionData('CONTACTS', this.userId).then((data: any[]) => {
      this.contacts = data as Contact[]; // Ensure the data is typed as Contact[]
      this.extractEmailAddresses();
    }).catch(error => {
      console.error('Error fetching contacts:', error);
    });
  }

  extractEmailAddresses(): void {
    this.allEmailAddresses = [];
    this.contacts.forEach(contact => {
      if (contact.emailAddresses) {
        contact.emailAddresses.forEach(emailAddress => {
          if (!emailAddress.blocked) {
            this.allEmailAddresses.push(emailAddress.emailAddress);
          }
        });
      }
    });
    this.filteredContacts = this.allEmailAddresses;
  }

  onRecipientInput(): void {
    const inputValue = this.emailForm.get('to')?.value.toLowerCase() || '';
    this.filteredContacts = this.allEmailAddresses.filter(contact =>
      contact.toLowerCase().includes(inputValue)
    );
    this.showSuggestions = this.filteredContacts.length > 0;
  }

  hideSuggestions(): void {
    setTimeout(() => this.showSuggestions = false, 200); // Delay to allow click selection
  }

  selectContact(contact: string): void {
    this.emailForm.get('to')?.setValue(contact);
    this.showSuggestions = false;
  }

  sendEmail(): void {
    if (this.emailForm.valid) {
      this.emailService.sendEmail(this.emailForm.value).subscribe(response => {
        console.log('Email sent successfully!', response);
      }, error => {
        console.error('Error sending email:', error);
      });
    }
  }

}
