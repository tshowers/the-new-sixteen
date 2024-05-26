import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  // Read-only company name from environment settings
  readonly COMPANY_NAME = environment.COMPANY_NAME;
  message!: string;

  // Form group for the sign-up form
  signupForm: FormGroup;

  // Constructor to initialize FormBuilder and AuthService
  constructor(private fb: FormBuilder, private authService: AuthService) {
    // Initialize the form with email and tenantId fields and their validation rules
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      tenantId: ['', [Validators.required]] // Add tenantId field
    });
  }

  // Getter for the email form control
  get email() {
    return this.signupForm.get('email');
  }

  // Getter for the tenantId form control
  get tenantId() {
    return this.signupForm.get('tenantId');
  }

  // Method to handle form submission
  onSubmit() {
    // Check if the form is valid before proceeding
    if (this.signupForm.valid) {
      // Destructure email and tenantId from form values
      const { email, tenantId } = this.signupForm.value;
      // Call AuthService to send the sign-up link
      this.authService.sendSignupLink(email, tenantId).subscribe({
        next: () => {
          // Handle successful link send
          alert('Signup link sent! Check your email.');
          this.message = 'Signup link sent! Check your email.';
        },
        error: (error: any) => {
          // Handle error
          console.error('Error sending signup link', error);
          this.message = 'Error sending signup link', error;
        }
      });
    }
  }
}
