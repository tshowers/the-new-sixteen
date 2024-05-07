import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';

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

  constructor(private authService: AuthService, private route: ActivatedRoute, private logger: LoggerService, private router:Router) {}

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
          this.message = 'Sign-in successful. Welcome!';
          // Redirect or update UI
          this.router.navigate(['contact-dashboard']);  // Redirect to dashboard or another route
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
