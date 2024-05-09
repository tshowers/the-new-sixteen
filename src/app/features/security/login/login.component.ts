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

  message!: string;

  constructor(private authService: AuthService, private router: Router, private logger: LoggerService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.logger.info("User is logged in " + this.isLoggedIn, JSON.stringify(user, null, 2) )
        // Optionally redirect the user
        this.router.navigate(['contact-dashboard']);  // Update with your route
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

  onSubmit(): void {
    this.subscription = this.authService.sendLoginLink(this.emailAddress).subscribe({
      next: () => {
        this.message = 'Sign-in link sent! Check your email.';
      },
      error: (error) => {
        this.message = `Failed to send link: ${error.message}`;
      }
    });
  }



}
