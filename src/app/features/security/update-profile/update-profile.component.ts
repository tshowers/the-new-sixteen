import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { LoggerService } from '../../../services/logger.service';
import { SubscriptionComponent } from '../../signup/subscription/subscription.component';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SubscriptionComponent],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css'
})
export class UpdateProfileComponent implements OnInit {

  updateProfileForm: FormGroup;
  contact!: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userService: UserService, private logger: LoggerService) {
    this.updateProfileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      photoURL: ['', Validators.pattern('https?://.+')],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required]
    });

    // Load current user data
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.userService.getLoggedInContactInfo().subscribe(contact => {
          this.updateProfileForm.patchValue({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            firstName: contact?.firstName,
            lastName: contact?.lastName,
            phone: contact?.phoneNumbers?.[0]?.phoneNumber
          });
        });
      }
    });
  }

  ngOnInit(): void {
      
  }

  onSubmit() {
    const { displayName, email, photoURL, firstName, lastName, phone } = this.updateProfileForm.value;
    this.authService.updateProfile(displayName, email, photoURL).subscribe({
      next: () => {
        this.userService.getLoggedInContactInfo().subscribe(contact => {
          if (contact) {
            contact.firstName = firstName;
            contact.lastName = lastName;
            contact.phoneNumbers = [{ phoneNumber: phone, phoneNumberType: 'primary' }];
            this.userService.updateContact(contact).subscribe({
              next: () => {
                alert('Profile and contact updated successfully');
                this.router.navigate(['/']); // Redirect to home or another page
              },
              error: (err) => {
                console.error('Contact update failed:', err);
                alert('Failed to update contact');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Profile update failed:', err);
        alert('Failed to update profile');
      }
    });
  }

  getContactRecord() {
    this.userService.getLoggedInContactInfo().subscribe(contact => {
      this.logger.info("Logged In Contact Info", contact);
      this.contact = contact;
    });
  }

}
