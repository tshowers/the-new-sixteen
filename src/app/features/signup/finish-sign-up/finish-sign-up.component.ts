import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-finish-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './finish-sign-up.component.html',
  styleUrl: './finish-sign-up.component.css'
})
export class FinishSignUpComponent implements OnInit {
  error: string | null = null;
  email: string | null = null;
  public message = "Processing your sign-up, please wait...";
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private userService: UserService,
    private logger: LoggerService,
    private router: Router) { }

    ngOnInit(): void {
      // Try to get email from local storage first
      this.email = localStorage.getItem('emailForSignUp');
      if (this.email) {
        this.completeSignUp();
      }
    }
  
    completeSignUp(): void {
      const url = window.location.href; // Get the full URL which includes the signInLink
      if (this.email) {
        this.authService.completeTenantSignInWithEmailLink(this.email, url).subscribe({
          next: (result) => {
            this.logger.log('Sign-up successful:', result);
            // Clear the email from localStorage and handle successful sign-in
            localStorage.removeItem('emailForSignUp');
            this.isLoggedIn = true;  // Update UI state
            this.message = 'Checking user data...'; // Inform user of ongoing setup
  
            const user = result.user;
            this.authService.getUser().subscribe(firebaseUser => {
              if (firebaseUser) {
                const tenantId = localStorage.getItem('tenantIdForSignUp'); // Retrieve tenant ID
                this.userService.findTenantCreateContact(tenantId!, firebaseUser.uid, firebaseUser.email).subscribe({
                  next: (contact) => {
                    this.userService.setLoggedInContactInfo(contact); // Store contact info
                    this.message = 'Sign-up successful. Welcome!';
                    this.router.navigate(['plan-selection']); // Redirect after setup
                  },
                  error: (err) => {
                    this.logger.error('Failed to setup user contact:', err);
                    this.error = 'Failed to initialize user data. Please contact support.';
                  }
                });
              } else {
                this.error = 'User not signed up.';
              }
            });
          },
          error: (error) => {
            this.logger.error('Sign-up failed:', error);
            this.error = 'Sign-up failed. Please try again.';
          }
        });
      } else {
        this.error = 'Please enter your email address to continue.';
      }
    }

}
