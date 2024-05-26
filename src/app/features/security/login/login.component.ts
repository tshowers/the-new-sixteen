import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  private userSubscription!: Subscription;
  private subscription!: Subscription;
  readonly COMPANY_NAME = environment.COMPANY_NAME;
  emailAddress: string = '';
  password: string = "";
  isLoggedIn = false;
  tosAgreed = false;  // Track if the ToS is agreed

  message!: string;

  constructor(private authService: AuthService, private router: Router, private logger: LoggerService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.logger.info("User is logged in " + this.isLoggedIn, JSON.stringify(user, null, 2))
        // Optionally redirect the user
        this.router.navigate(['start-page']);  // Update with your route
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  acceptTerms(): void {
    this.tosAgreed = true;
  }

  signInWithGoogle(): void {
    if (!this.tosAgreed) {
      this.message = 'You must agree to the Terms of Service before proceeding.';
      return;
    }

    this.authService.sendLoginWithGoogle();

  }

  onSubmit(): void {
    if (!this.tosAgreed) {
      this.message = 'You must agree to the Terms of Service before proceeding.';
      return;
    }


    if (environment.authorizedEmails.includes(this.emailAddress.toLowerCase())) {
      this.subscription = this.authService.sendLoginLink(this.emailAddress).subscribe({
        next: () => {
          this.message = 'Sign-in link sent! Check your email.';
        },
        error: (error) => {
          this.message = `Failed to send link: ${error.message}`;
        }
      });
    } else {
      this.message = 'Your email address is not authorized to access this application.';
    }
  }


  useBegin(): void {

    if (!this.tosAgreed) {
      this.message = 'You must agree to the Terms of Service before proceeding.';
      return;
    }

    if (environment.authorizedEmails.includes(this.emailAddress.toLowerCase())) {


    this.router.navigate(['/start-page']);
    } else {
      this.message = 'Your email address is not authorized to access this application.';
    }
  }



}
