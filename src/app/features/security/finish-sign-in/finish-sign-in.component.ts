import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';
import { Contact } from '../../../shared/data/interfaces/contact.model';

@Component({
  selector: 'app-finish-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './finish-sign-in.component.html',
  styleUrl: './finish-sign-in.component.css'
})
export class FinishSignInComponent implements OnInit {

  error: string | null = null;
  email: string | null = null;
  public message = "Processing your sign-in, please wait...";
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, 
    private route: ActivatedRoute, 
    private userService: UserService,
    private logger: LoggerService, 
    private router:Router) {}

  ngOnInit(): void {
    // Try to get email from local storage first
    this.email = localStorage.getItem('emailForSignIn');
    if (this.email) {
      this.completeSignIn();
    }
  }

  completeSignIn(): void {
    const url = window.location.href; // Get the full URL which includes the signInLink
    if (this.email) {
      this.authService.completeSignInWithEmailLink(this.email, url).subscribe({
        next: (result) => {
          this.logger.log('Sign-in successful:', result);
          // Clear the email from localStorage and handle successful sign-in
          localStorage.removeItem('emailForSignIn');
          this.isLoggedIn = true;  // Update UI state
          this.message = 'Checking user data...'; // Inform user of ongoing setup

          const user = result.user;
          this.authService.getUser().subscribe(firebaseUser => {
            if (firebaseUser) {
              this.userService.findOrCreateContact(firebaseUser.uid, firebaseUser.email).subscribe({
                next: (contact) => {
                  this.userService.setLoggedInContactInfo(contact); // Store contact info
                  this.message = 'Sign-in successful. Welcome!';
                  this.router.navigate(['start-page']); // Redirect after setup
                },
                error: (err) => {
                  this.logger.error('Failed to setup user contact:', err);
                  this.error = 'Failed to initialize user data. Please contact support.';
                }
              });

              setTimeout(() => {
                this.message = 'Sign-in successful. Welcome!';
                // Redirect or update UI
                this.router.navigate(['start-page']);  // Redirect to dashboard or another route
              }, 2000);
            } else {
              this.error = 'User not logged in.';
            }
          });
        },
        error: (error) => {
          this.logger.error('Sign-in failed:', error);
          this.error = 'Sign-in failed. Please try again.';
        }
      });
    } else {
      this.error = 'Please enter your email address to continue.';
    }
  }

}
