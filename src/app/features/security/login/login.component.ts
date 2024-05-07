import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private subscription!: Subscription;
  readonly COMPANY_NAME = environment.COMPANY_NAME;
  emailAddress: string = '';
  password: string = "";

  message!: string;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.authService.sendLoginLink(this.emailAddress).subscribe({
      next: () => {
        this.message = 'Sign-in link sent! Check your email.';
      },
      error: (error) => {
        this.message = `Failed to send link: ${error.message}`;
      }
    });
  }

}
